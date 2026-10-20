package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;

/**
 * Tracks one revision session for any content item.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class RevisionRecord {

    private String id;
    private String entityId;
    private String entityType;       // NOTE, PROBLEM, INTERVIEW_QUESTION
    private String entityTitle;      // Denormalized for display
    private RevisionOutcome outcome;
    private String notes;
    private String nextRevisionDate; // ISO date
    private int intervalDays;
    private Instant revisedAt;

    public enum RevisionOutcome { REMEMBERED, PARTIALLY_REMEMBERED, NOT_REMEMBERED }

    public RevisionRecord() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityTitle() { return entityTitle; }
    public void setEntityTitle(String entityTitle) { this.entityTitle = entityTitle; }

    public RevisionOutcome getOutcome() { return outcome; }
    public void setOutcome(RevisionOutcome outcome) { this.outcome = outcome; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getNextRevisionDate() { return nextRevisionDate; }
    public void setNextRevisionDate(String nextRevisionDate) { this.nextRevisionDate = nextRevisionDate; }

    public int getIntervalDays() { return intervalDays; }
    public void setIntervalDays(int intervalDays) { this.intervalDays = intervalDays; }

    public Instant getRevisedAt() { return revisedAt; }
    public void setRevisedAt(Instant revisedAt) { this.revisedAt = revisedAt; }
}
