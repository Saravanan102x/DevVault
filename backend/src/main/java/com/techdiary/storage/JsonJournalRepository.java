package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.JournalEntry;
import com.techdiary.repository.JournalRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonJournalRepository implements JournalRepository {

    private static final String FILE = "journal-entries.json";
    private static final TypeReference<List<JournalEntry>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonJournalRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public JournalEntry save(JournalEntry entry) {
        List<JournalEntry> all = storage.readList(FILE, TYPE);
        all.removeIf(e -> e.getId().equals(entry.getId()));
        all.add(entry);
        storage.writeList(FILE, all);
        return entry;
    }

    @Override
    public Optional<JournalEntry> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(e -> e.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<JournalEntry> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<JournalEntry> all = storage.readList(FILE, TYPE);
        all.removeIf(e -> e.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(e -> e.getId().equals(id));
    }

    @Override
    public Optional<JournalEntry> findByDate(String date) {
        return storage.readList(FILE, TYPE).stream()
                .filter(e -> date.equals(e.getDate()))
                .findFirst();
    }

    @Override
    public List<JournalEntry> findRecent(int limit) {
        return storage.readList(FILE, TYPE).stream()
                .sorted(Comparator.comparing(JournalEntry::getDate).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<JournalEntry> findByDateRange(String from, String to) {
        return storage.readList(FILE, TYPE).stream()
                .filter(e -> e.getDate() != null
                        && e.getDate().compareTo(from) >= 0
                        && e.getDate().compareTo(to) <= 0)
                .sorted(Comparator.comparing(JournalEntry::getDate).reversed())
                .collect(Collectors.toList());
    }
}
