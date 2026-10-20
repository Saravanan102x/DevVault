package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a DSA or Java coding problem.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Problem {

    private String id;

    @NotBlank(message = "Problem title cannot be blank")
    private String title;
    private String statement;
    private String sourceUrl;        // LeetCode, HackerRank, etc.
    private Difficulty difficulty;
    private ProblemType type;        // DSA or JAVA_PRACTICE
    private ProblemStatus status = ProblemStatus.NOT_STARTED;
    private List<String> tags = new ArrayList<>();
    private List<String> companyIds = new ArrayList<>();
    private List<Solution> solutions = new ArrayList<>();
    private String keyInsight;
    private String edgeCases;
    private String personalExplanation;
    private int attemptCount;
    private boolean needsRevision;
    private String revisionDate;
    private List<GitHubReference> githubReferences = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public enum Difficulty { EASY, MEDIUM, HARD }
    public enum ProblemType { DSA, JAVA_PRACTICE }
    public enum ProblemStatus { NOT_STARTED, ATTEMPTED, SOLVED, NEEDS_REVISION }

    public Problem() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getStatement() { return statement; }
    public void setStatement(String statement) { this.statement = statement; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public ProblemType getType() { return type; }
    public void setType(ProblemType type) { this.type = type; }

    public ProblemStatus getStatus() { return status; }
    public void setStatus(ProblemStatus status) { this.status = status; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public List<String> getCompanyIds() { return companyIds; }
    public void setCompanyIds(List<String> companyIds) {
        this.companyIds = companyIds != null ? companyIds : new ArrayList<>();
    }

    public List<Solution> getSolutions() { return solutions; }
    public void setSolutions(List<Solution> solutions) {
        this.solutions = solutions != null ? solutions : new ArrayList<>();
    }

    public String getKeyInsight() { return keyInsight; }
    public void setKeyInsight(String keyInsight) { this.keyInsight = keyInsight; }

    public String getEdgeCases() { return edgeCases; }
    public void setEdgeCases(String edgeCases) { this.edgeCases = edgeCases; }

    public String getPersonalExplanation() { return personalExplanation; }
    public void setPersonalExplanation(String personalExplanation) {
        this.personalExplanation = personalExplanation;
    }

    public int getAttemptCount() { return attemptCount; }
    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }

    public boolean isNeedsRevision() { return needsRevision; }
    public void setNeedsRevision(boolean needsRevision) { this.needsRevision = needsRevision; }

    public String getRevisionDate() { return revisionDate; }
    public void setRevisionDate(String revisionDate) { this.revisionDate = revisionDate; }

    public List<GitHubReference> getGithubReferences() { return githubReferences; }
    public void setGithubReferences(List<GitHubReference> githubReferences) {
        this.githubReferences = githubReferences != null ? githubReferences : new ArrayList<>();
    }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
