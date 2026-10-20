package com.techdiary.repository;

import com.techdiary.model.RevisionRecord;
import java.util.List;

public interface RevisionRepository extends CrudRepository<RevisionRecord, String> {
    List<RevisionRecord> findByEntityId(String entityId);
    List<RevisionRecord> findDueToday();
    List<RevisionRecord> findOverdue();
    List<RevisionRecord> findUpcoming(int days);
    List<RevisionRecord> findRecentlyRevised(int limit);
}
