package com.techdiary.service;

import com.techdiary.config.TechDiaryProperties;
import com.techdiary.storage.JsonFileStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.zip.*;

/**
 * Backup and restore service.
 * All data lives in JSON files — backup = zip them, restore = unzip and replace.
 */
@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);

    private final JsonFileStorage storage;
    private final Path backupDir;

    public BackupService(JsonFileStorage storage, TechDiaryProperties properties) {
        this.storage = storage;
        this.backupDir = Path.of(properties.backup().directory());
    }

    /**
     * Zips all JSON data files and returns the resulting ZIP bytes.
     */
    public byte[] export() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            try (var stream = Files.walk(storage.getDataDir())) {
                stream.filter(p -> !Files.isDirectory(p))
                      .filter(p -> p.toString().endsWith(".json"))
                      .forEach(p -> {
                          try {
                              ZipEntry entry = new ZipEntry(p.getFileName().toString());
                              zos.putNextEntry(entry);
                              Files.copy(p, zos);
                              zos.closeEntry();
                          } catch (IOException e) {
                              log.warn("Could not add {} to backup zip", p, e);
                          }
                      });
            }
        }
        log.info("Exported backup: {} bytes", baos.size());
        return baos.toByteArray();
    }

    private static final int MAX_ZIP_ENTRIES = 50;
    private static final long MAX_ENTRY_BYTES = 10 * 1024 * 1024; // 10 MB per file
    private static final long MAX_TOTAL_BYTES = 25 * 1024 * 1024; // 25 MB total

    /**
     * Restores data from an uploaded ZIP file.
     * Backs up current data first, then replaces with ZIP contents.
     */
    public void restore(byte[] zipBytes) throws IOException {
        if (zipBytes == null || zipBytes.length == 0) {
            throw new IllegalArgumentException("Backup archive is empty");
        }

        // Backup current data first
        Files.createDirectories(backupDir);
        storage.backup(backupDir);

        int entryCount = 0;
        long totalBytesExtracted = 0;

        // Extract zip into data directory with Zip Slip and Zip Bomb prevention
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipBytes))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                entryCount++;
                if (entryCount > MAX_ZIP_ENTRIES) {
                    throw new SecurityException("Too many entries in zip file (max allowed: " + MAX_ZIP_ENTRIES + ")");
                }

                String rawName = entry.getName();
                // Ensure entry is only a simple filename (no slashes, backslashes, or directory separators)
                if (rawName == null || rawName.contains("/") || rawName.contains("\\") || !rawName.endsWith(".json")) {
                    log.warn("Skipping invalid or nested entry: {}", rawName);
                    zis.closeEntry();
                    continue;
                }

                // Verify normalized destination remains strictly inside storage data directory (Anti-Zip Slip)
                Path target = storage.getDataDir().resolve(rawName).normalize();
                if (!target.startsWith(storage.getDataDir().normalize())) {
                    throw new SecurityException("Zip Slip path traversal attempt detected for entry: " + rawName);
                }

                Path tmp = storage.getDataDir().resolve(rawName + ".restore.tmp");

                // Read bytes with size limit check (Anti-Zip Bomb)
                ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                byte[] chunk = new byte[8192];
                int read;
                long entryBytes = 0;
                while ((read = zis.read(chunk)) != -1) {
                    entryBytes += read;
                    totalBytesExtracted += read;
                    if (entryBytes > MAX_ENTRY_BYTES) {
                        throw new SecurityException("Single zip entry exceeded max allowed size of " + MAX_ENTRY_BYTES + " bytes");
                    }
                    if (totalBytesExtracted > MAX_TOTAL_BYTES) {
                        throw new SecurityException("Total uncompressed zip size exceeded limit of " + MAX_TOTAL_BYTES + " bytes");
                    }
                    buffer.write(chunk, 0, read);
                }

                Files.write(tmp, buffer.toByteArray(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                try {
                    Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
                } catch (AtomicMoveNotSupportedException | AccessDeniedException e) {
                    Files.move(tmp, target, StandardCopyOption.REPLACE_EXISTING);
                }
                zis.closeEntry();
            }
        }
        log.info("Restore complete. Processed {} entries, {} bytes", entryCount, totalBytesExtracted);
    }
}
