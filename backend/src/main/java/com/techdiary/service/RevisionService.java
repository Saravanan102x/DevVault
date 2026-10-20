package com.techdiary.service;

import com.techdiary.exception.ResourceNotFoundException;
import com.techdiary.model.RevisionRecord;
import com.techdiary.repository.RevisionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class RevisionService {

    private final RevisionRepository revisionRepository;

    // Spaced-repetition intervals in days
    private static final int[] INTERVALS = {1, 3, 7, 14, 30, 60, 90};

    public RevisionService(RevisionRepository revisionRepository) {
        this.revisionRepository = revisionRepository;
    }

    public RevisionRecord record(RevisionRecord record) {
        record.setId(UUID.randomUUID().toString());
        record.setRevisedAt(Instant.now());
        // Calculate next revision date based on outcome
        int intervalDays = calculateInterval(record.getEntityId(), record.getOutcome());
        record.setIntervalDays(intervalDays);
        record.setNextRevisionDate(LocalDate.now().plusDays(intervalDays).toString());
        return revisionRepository.save(record);
    }

    public List<RevisionRecord> findByEntityId(String entityId) {
        return revisionRepository.findByEntityId(entityId);
    }

    public List<RevisionRecord> findDueToday() {
        return revisionRepository.findDueToday();
    }

    public List<RevisionRecord> findOverdue() {
        return revisionRepository.findOverdue();
    }

    public List<RevisionRecord> findUpcoming(int days) {
        return revisionRepository.findUpcoming(days);
    }

    public List<RevisionRecord> findRecentlyRevised(int limit) {
        return revisionRepository.findRecentlyRevised(limit);
    }

    public void delete(String id) {
        if (!revisionRepository.existsById(id)) {
            throw new ResourceNotFoundException("RevisionRecord", id);
        }
        revisionRepository.deleteById(id);
    }

    private int calculateInterval(String entityId, RevisionRecord.RevisionOutcome outcome) {
        List<RevisionRecord> history = revisionRepository.findByEntityId(entityId);
        int attempt = history.size(); // how many times revised before this
        return switch (outcome) {
            case REMEMBERED -> INTERVALS[Math.min(attempt, INTERVALS.length - 1)];
            case PARTIALLY_REMEMBERED -> INTERVALS[Math.max(0, Math.min(attempt - 1, INTERVALS.length - 1))];
            case NOT_REMEMBERED -> 1;
        };
    }
}
