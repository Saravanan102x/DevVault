package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A daily learning journal entry.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class JournalEntry {

    private String id;
    private String date;             // ISO date, e.g. "2025-06-15"
    private String title;
    private String whatIStudied;     // Markdown
    private String whatIImplemented; // Markdown
    private String challenges;       // Markdown
    private String toRevise;         // Markdown
    private String mood;
    private List<String> tags = new ArrayList<>();
    private List<String> relatedProblemIds = new ArrayList<>();
    private List<String> relatedNoteIds = new ArrayList<>();
    private int productivityScore;   // 1-5
    private Instant createdAt;
    private Instant updatedAt;

    public JournalEntry() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getWhatIStudied() { return whatIStudied; }
    public void setWhatIStudied(String whatIStudied) { this.whatIStudied = whatIStudied; }

    public String getWhatIImplemented() { return whatIImplemented; }
    public void setWhatIImplemented(String whatIImplemented) { this.whatIImplemented = whatIImplemented; }

    public String getChallenges() { return challenges; }
    public void setChallenges(String challenges) { this.challenges = challenges; }

    public String getToRevise() { return toRevise; }
    public void setToRevise(String toRevise) { this.toRevise = toRevise; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public List<String> getRelatedProblemIds() { return relatedProblemIds; }
    public void setRelatedProblemIds(List<String> ids) {
        this.relatedProblemIds = ids != null ? ids : new ArrayList<>();
    }

    public List<String> getRelatedNoteIds() { return relatedNoteIds; }
    public void setRelatedNoteIds(List<String> ids) {
        this.relatedNoteIds = ids != null ? ids : new ArrayList<>();
    }

    public int getProductivityScore() { return productivityScore; }
    public void setProductivityScore(int productivityScore) { this.productivityScore = productivityScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
