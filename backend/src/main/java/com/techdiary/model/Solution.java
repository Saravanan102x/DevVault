package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents one solution attempt for a problem.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Solution {

    private String id;
    private String problemId;
    private String title;           // e.g., "Brute Force", "Optimized DP"
    private String approach;        // BRUTE_FORCE, OPTIMIZED, ALTERNATIVE
    private String code;            // Java source code
    private String language = "java";
    private String explanation;
    private String timeComplexity;
    private String spaceComplexity;
    private String inputExample;
    private String outputExample;
    private String mistakes;
    private String alternativeApproaches;
    private Integer timeTakenMinutes;
    private List<String> tags = new ArrayList<>();
    private List<GitHubReference> githubReferences = new ArrayList<>();
    private SolutionStatus status = SolutionStatus.DRAFT;
    private String practiceDate;    // ISO date
    private Instant createdAt;
    private Instant updatedAt;

    public enum SolutionStatus { DRAFT, SAVED, NEEDS_REVISION }

    public Solution() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getApproach() { return approach; }
    public void setApproach(String approach) { this.approach = approach; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }

    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }

    public String getInputExample() { return inputExample; }
    public void setInputExample(String inputExample) { this.inputExample = inputExample; }

    public String getOutputExample() { return outputExample; }
    public void setOutputExample(String outputExample) { this.outputExample = outputExample; }

    public String getMistakes() { return mistakes; }
    public void setMistakes(String mistakes) { this.mistakes = mistakes; }

    public String getAlternativeApproaches() { return alternativeApproaches; }
    public void setAlternativeApproaches(String alternativeApproaches) {
        this.alternativeApproaches = alternativeApproaches;
    }

    public Integer getTimeTakenMinutes() { return timeTakenMinutes; }
    public void setTimeTakenMinutes(Integer timeTakenMinutes) { this.timeTakenMinutes = timeTakenMinutes; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public List<GitHubReference> getGithubReferences() { return githubReferences; }
    public void setGithubReferences(List<GitHubReference> githubReferences) {
        this.githubReferences = githubReferences != null ? githubReferences : new ArrayList<>();
    }

    public SolutionStatus getStatus() { return status; }
    public void setStatus(SolutionStatus status) { this.status = status; }

    public String getPracticeDate() { return practiceDate; }
    public void setPracticeDate(String practiceDate) { this.practiceDate = practiceDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
