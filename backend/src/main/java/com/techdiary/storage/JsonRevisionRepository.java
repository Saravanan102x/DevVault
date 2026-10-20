package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.RevisionRecord;
import com.techdiary.repository.RevisionRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonRevisionRepository implements RevisionRepository {

    private static final String FILE = "revision-records.json";
    private static final TypeReference<List<RevisionRecord>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonRevisionRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public RevisionRecord save(RevisionRecord record) {
        List<RevisionRecord> all = storage.readList(FILE, TYPE);
        all.removeIf(r -> r.getId().equals(record.getId()));
        all.add(record);
        storage.writeList(FILE, all);
        return record;
    }

    @Override
    public Optional<RevisionRecord> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(r -> r.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<RevisionRecord> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<RevisionRecord> all = storage.readList(FILE, TYPE);
        all.removeIf(r -> r.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(r -> r.getId().equals(id));
    }

    @Override
    public List<RevisionRecord> findByEntityId(String entityId) {
        return storage.readList(FILE, TYPE).stream()
                .filter(r -> entityId.equals(r.getEntityId()))
                .sorted(Comparator.comparing(RevisionRecord::getRevisedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<RevisionRecord> findDueToday() {
        String today = LocalDate.now().toString();
        return storage.readList(FILE, TYPE).stream()
                .filter(r -> today.equals(r.getNextRevisionDate()))
                .collect(Collectors.toList());
    }

    @Override
    public List<RevisionRecord> findOverdue() {
        String today = LocalDate.now().toString();
        return storage.readList(FILE, TYPE).stream()
                .filter(r -> r.getNextRevisionDate() != null
                        && r.getNextRevisionDate().compareTo(today) < 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<RevisionRecord> findUpcoming(int days) {
        String today = LocalDate.now().toString();
        String limit = LocalDate.now().plusDays(days).toString();
        return storage.readList(FILE, TYPE).stream()
                .filter(r -> r.getNextRevisionDate() != null
                        && r.getNextRevisionDate().compareTo(today) > 0
                        && r.getNextRevisionDate().compareTo(limit) <= 0)
                .collect(Collectors.toList());
    }

    @Override
    public List<RevisionRecord> findRecentlyRevised(int limit) {
        return storage.readList(FILE, TYPE).stream()
                .filter(r -> r.getRevisedAt() != null)
                .sorted(Comparator.comparing(RevisionRecord::getRevisedAt).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }
}
