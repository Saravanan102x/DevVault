package com.techdiary.repository;

import com.techdiary.model.JournalEntry;
import java.util.List;
import java.util.Optional;

public interface JournalRepository extends CrudRepository<JournalEntry, String> {
    Optional<JournalEntry> findByDate(String date);
    List<JournalEntry> findRecent(int limit);
    List<JournalEntry> findByDateRange(String from, String to);
}
