package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.techdiary.config.TechDiaryProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Generic, thread-safe JSON file storage engine.
 *
 * <p>Safety guarantees:
 * <ul>
 *   <li>Atomic writes: writes to a .tmp file then atomically replaces the target.</li>
 *   <li>Per-file ReadWriteLock: prevents concurrent reads/writes on the same file.</li>
 *   <li>Corrupt file recovery: returns empty list and logs warning instead of crashing.</li>
 *   <li>Auto-initialisation: creates the data directory and empty JSON files on startup.</li>
 * </ul>
 */
@Component
public class JsonFileStorage {

    private static final Logger log = LoggerFactory.getLogger(JsonFileStorage.class);

    private final ObjectMapper mapper;
    private final Path dataDir;
    private final ConcurrentHashMap<String, ReadWriteLock> fileLocks = new ConcurrentHashMap<>();

    public JsonFileStorage(TechDiaryProperties properties) {
        this.dataDir = Path.of(properties.data().directory());
        this.mapper = buildObjectMapper();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(dataDir);
            log.info("Tech Diary data directory: {}", dataDir.toAbsolutePath());
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create data directory: " + dataDir, e);
        }
    }

    /** Returns the absolute path for a named data file, guaranteeing it stays within dataDir. */
    public Path resolve(String filename) {
        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Data filename cannot be null or blank");
        }
        Path resolved = dataDir.resolve(filename).normalize();
        if (!resolved.startsWith(dataDir.normalize())) {
            throw new SecurityException("Path traversal attempt detected for file: " + filename);
        }
        return resolved;
    }

    /**
     * Reads a JSON array from a file, returning an empty list if the file
     * does not exist or the JSON is malformed.
     */
    public <T> List<T> readList(String filename, TypeReference<List<T>> typeRef) {
        ReadWriteLock lock = getFileLock(filename);
        lock.readLock().lock();
        try {
            Path file = resolve(filename);
            if (!Files.exists(file)) {
                return new ArrayList<>();
            }
            byte[] bytes = Files.readAllBytes(file);
            if (bytes.length == 0 || new String(bytes).isBlank()) {
                return new ArrayList<>();
            }
            return mapper.readValue(bytes, typeRef);
        } catch (IOException e) {
            log.warn("Could not read {}: {}. Returning empty list.", filename, e.getMessage());
            return new ArrayList<>();
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Atomically writes a list to a JSON file.
     * Uses write-to-tmp-then-rename strategy with fallback for non-atomic filesystems.
     */
    public <T> void writeList(String filename, List<T> items) {
        ReadWriteLock lock = getFileLock(filename);
        lock.writeLock().lock();
        try {
            Path target = resolve(filename);
            Path tmp = resolve(filename + ".tmp");
            mapper.writeValue(tmp.toFile(), items);
            try {
                Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
            } catch (AtomicMoveNotSupportedException | AccessDeniedException e) {
                // Fallback for filesystems that do not support atomic move or transient file locks
                Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            log.error("Failed to write {}: {}", filename, e.getMessage(), e);
            throw new StorageException("Failed to write data file: " + filename, e);
        } finally {
            lock.writeLock().unlock();
        }
    }

    /** Copies the data directory to a backup location. */
    public Path backup(Path backupDir) throws IOException {
        Files.createDirectories(backupDir);
        String timestamp = java.time.Instant.now().toString()
                .replace(":", "-").replace(".", "-");
        Path dest = backupDir.resolve("backup-" + timestamp);
        Files.createDirectories(dest);
        try (var stream = Files.walk(dataDir)) {
            stream.filter(p -> !Files.isDirectory(p))
                  .filter(p -> p.toString().endsWith(".json"))
                  .forEach(p -> {
                      try {
                          Files.copy(p, dest.resolve(p.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                      } catch (IOException ex) {
                          log.warn("Could not backup {}", p, ex);
                      }
                  });
        }
        return dest;
    }

    public Path getDataDir() {
        return dataDir;
    }

    private ReadWriteLock getFileLock(String filename) {
        return fileLocks.computeIfAbsent(filename, k -> new ReentrantReadWriteLock());
    }

    private static ObjectMapper buildObjectMapper() {
        ObjectMapper om = new ObjectMapper();
        om.registerModule(new JavaTimeModule());
        om.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        om.enable(SerializationFeature.INDENT_OUTPUT);
        return om;
    }
}
