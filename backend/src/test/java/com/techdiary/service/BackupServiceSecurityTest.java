package com.techdiary.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.config.TechDiaryProperties;
import com.techdiary.storage.JsonFileStorage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class BackupServiceSecurityTest {

    @TempDir
    Path tempDir;

    private JsonFileStorage storage;
    private BackupService backupService;

    @BeforeEach
    void setUp() {
        TechDiaryProperties properties = new TechDiaryProperties(
                new TechDiaryProperties.DataConfig(tempDir.resolve("data").toString()),
                new TechDiaryProperties.BackupConfig(tempDir.resolve("backups").toString())
        );
        storage = new JsonFileStorage(properties);
        storage.init();
        backupService = new BackupService(storage, properties);
    }

    @Test
    void testEmptyZipThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> backupService.restore(new byte[0]));
    }

    @Test
    void testZipSlipPathTraversalRejected() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // Malicious entry attempting to escape dataDir
            ZipEntry entry = new ZipEntry("../malicious.json");
            zos.putNextEntry(entry);
            zos.write("[{\"malicious\": true}]".getBytes());
            zos.closeEntry();
        }

        // Must skip or throw SecurityException without creating files outside dataDir
        backupService.restore(baos.toByteArray());
        assertFalse(tempDir.resolve("malicious.json").toFile().exists());
    }

    @Test
    void testNestedPathEntrySkippedSafely() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // Subdirectory path entry
            ZipEntry entry = new ZipEntry("subdir/notes.json");
            zos.putNextEntry(entry);
            zos.write("[{\"test\": 1}]".getBytes());
            zos.closeEntry();
        }

        backupService.restore(baos.toByteArray());
        assertFalse(tempDir.resolve("data/subdir/notes.json").toFile().exists());
    }

    @Test
    void testValidExportAndRestoreCycle() throws IOException {
        storage.writeList("notes.json", List.of("Note 1", "Note 2"));

        byte[] backupZip = backupService.export();
        assertNotNull(backupZip);
        assertTrue(backupZip.length > 0);

        // Wipe data
        storage.writeList("notes.json", List.of());
        assertEquals(0, storage.readList("notes.json", new TypeReference<List<String>>() {}).size());

        // Restore
        backupService.restore(backupZip);
        List<String> restored = storage.readList("notes.json", new TypeReference<List<String>>() {});
        assertEquals(2, restored.size());
        assertEquals("Note 1", restored.get(0));
    }
}
