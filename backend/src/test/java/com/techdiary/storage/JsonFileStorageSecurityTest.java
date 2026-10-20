package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.config.TechDiaryProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JsonFileStorageSecurityTest {

    @TempDir
    Path tempDir;

    private JsonFileStorage storage;

    @BeforeEach
    void setUp() {
        TechDiaryProperties properties = new TechDiaryProperties(
                new TechDiaryProperties.DataConfig(tempDir.toString()),
                new TechDiaryProperties.BackupConfig(tempDir.resolve("backups").toString())
        );
        storage = new JsonFileStorage(properties);
        storage.init();
    }

    @Test
    void testResolveValidFilename() {
        Path resolved = storage.resolve("notes.json");
        assertNotNull(resolved);
        assertTrue(resolved.startsWith(tempDir));
        assertEquals("notes.json", resolved.getFileName().toString());
    }

    @Test
    void testResolvePathTraversalThrowsSecurityException() {
        assertThrows(SecurityException.class, () -> storage.resolve("../etc/passwd.json"));
        assertThrows(SecurityException.class, () -> storage.resolve("../../secret.json"));
        assertThrows(SecurityException.class, () -> storage.resolve("..\\windows\\system32.json"));
    }

    @Test
    void testResolveNullOrBlankThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> storage.resolve(null));
        assertThrows(IllegalArgumentException.class, () -> storage.resolve("   "));
    }

    @Test
    void testWriteAndReadListAtomic() {
        List<String> items = List.of("Java 21", "Virtual Threads", "Security");
        TypeReference<List<String>> typeRef = new TypeReference<>() {};

        storage.writeList("test.json", items);
        List<String> readBack = storage.readList("test.json", typeRef);

        assertEquals(3, readBack.size());
        assertEquals("Java 21", readBack.get(0));
    }

    @Test
    void testReadNonExistentFileReturnsEmptyList() {
        TypeReference<List<String>> typeRef = new TypeReference<>() {};
        List<String> readBack = storage.readList("non-existent.json", typeRef);
        assertNotNull(readBack);
        assertTrue(readBack.isEmpty());
    }

    @Test
    void testCorruptFileReturnsEmptyListGracefully() throws IOException {
        Path file = tempDir.resolve("corrupt.json");
        Files.writeString(file, "{ this is not valid json");

        TypeReference<List<String>> typeRef = new TypeReference<>() {};
        List<String> readBack = storage.readList("corrupt.json", typeRef);
        assertNotNull(readBack);
        assertTrue(readBack.isEmpty());
    }
}
