package com.techdiary.service;

import com.techdiary.exception.ResourceNotFoundException;
import com.techdiary.model.JournalEntry;
import com.techdiary.repository.JournalRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class JournalService {

    private final JournalRepository journalRepository;

    public JournalService(JournalRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    public List<JournalEntry> findAll() {
        return journalRepository.findAll();
    }

    public JournalEntry findById(String id) {
        return journalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JournalEntry", id));
    }

    public JournalEntry findOrCreateToday() {
        String today = LocalDate.now().toString();
        return journalRepository.findByDate(today).orElseGet(() -> {
            JournalEntry entry = new JournalEntry();
            entry.setDate(today);
            entry.setTitle("Journal — " + today);
            return create(entry);
        });
    }

    public JournalEntry create(JournalEntry entry) {
        entry.setId(UUID.randomUUID().toString());
        entry.setCreatedAt(Instant.now());
        entry.setUpdatedAt(Instant.now());
        if (entry.getDate() == null) entry.setDate(LocalDate.now().toString());
        return journalRepository.save(entry);
    }

    public JournalEntry update(String id, JournalEntry updated) {
        JournalEntry existing = findById(id);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        return journalRepository.save(updated);
    }

    public void delete(String id) {
        if (!journalRepository.existsById(id)) {
            throw new ResourceNotFoundException("JournalEntry", id);
        }
        journalRepository.deleteById(id);
    }

    public List<JournalEntry> findRecent(int limit) {
        return journalRepository.findRecent(limit);
    }

    public List<JournalEntry> findByDateRange(String from, String to) {
        return journalRepository.findByDateRange(from, to);
    }
}
