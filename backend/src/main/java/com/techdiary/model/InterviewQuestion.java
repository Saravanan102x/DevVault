package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * An interview question — technical, HR, or self-introduction.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class InterviewQuestion {

    private String id;

    @NotBlank(message = "Interview question cannot be blank")
    private String question;
    private String answer;           // Markdown
    private QuestionCategory category;
    private String folder;
    private List<String> companyIds = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private String sourceUrl;
    private String round;            // e.g., "Technical Round 1"
    private Difficulty difficulty;
    private PreparationStatus preparationStatus = PreparationStatus.NOT_STARTED;
    private boolean needsRevision;
    private String revisionDate;
    private List<String> relatedNoteIds = new ArrayList<>();
    private List<String> relatedProblemIds = new ArrayList<>();
    private DataSource dataSource = DataSource.PERSONAL;
    private Instant createdAt;
    private Instant updatedAt;

    public enum QuestionCategory { TECHNICAL, HR, SELF_INTRODUCTION, DSA, SYSTEM_DESIGN }
    public enum Difficulty { EASY, MEDIUM, HARD }
    public enum PreparationStatus { NOT_STARTED, IN_PROGRESS, READY, NEEDS_REVISION }
    public enum DataSource { VERIFIED, PERSONAL, UNSOURCED }

    public InterviewQuestion() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public QuestionCategory getCategory() { return category; }
    public void setCategory(QuestionCategory category) { this.category = category; }

    public String getFolder() { return folder; }
    public void setFolder(String folder) { this.folder = folder; }

    public List<String> getCompanyIds() { return companyIds; }
    public void setCompanyIds(List<String> companyIds) {
        this.companyIds = companyIds != null ? companyIds : new ArrayList<>();
    }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public PreparationStatus getPreparationStatus() { return preparationStatus; }
    public void setPreparationStatus(PreparationStatus preparationStatus) {
        this.preparationStatus = preparationStatus;
    }

    public boolean isNeedsRevision() { return needsRevision; }
    public void setNeedsRevision(boolean needsRevision) { this.needsRevision = needsRevision; }

    public String getRevisionDate() { return revisionDate; }
    public void setRevisionDate(String revisionDate) { this.revisionDate = revisionDate; }

    public List<String> getRelatedNoteIds() { return relatedNoteIds; }
    public void setRelatedNoteIds(List<String> relatedNoteIds) {
        this.relatedNoteIds = relatedNoteIds != null ? relatedNoteIds : new ArrayList<>();
    }

    public List<String> getRelatedProblemIds() { return relatedProblemIds; }
    public void setRelatedProblemIds(List<String> relatedProblemIds) {
        this.relatedProblemIds = relatedProblemIds != null ? relatedProblemIds : new ArrayList<>();
    }

    public DataSource getDataSource() { return dataSource; }
    public void setDataSource(DataSource dataSource) { this.dataSource = dataSource; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
