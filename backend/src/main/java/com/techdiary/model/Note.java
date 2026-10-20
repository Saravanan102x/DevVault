package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a technical note entry.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Note {

    private String id;

    @NotBlank(message = "Note title cannot be blank")
    private String title;
    private String content;          // Markdown content
    private String category;
    private String folder;
    private List<String> tags = new ArrayList<>();
    private List<String> relatedProblemIds = new ArrayList<>();
    private List<String> relatedCompanyIds = new ArrayList<>();
    private List<String> sourceUrls = new ArrayList<>();
    private boolean favourite;
    private boolean pinned;
    private String revisionDate;     // ISO date string, optional
    private NoteStatus status = NoteStatus.ACTIVE;
    private Instant createdAt;
    private Instant updatedAt;

    public enum NoteStatus { ACTIVE, ARCHIVED }

    public Note() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFolder() { return folder; }
    public void setFolder(String folder) { this.folder = folder; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public List<String> getRelatedProblemIds() { return relatedProblemIds; }
    public void setRelatedProblemIds(List<String> relatedProblemIds) {
        this.relatedProblemIds = relatedProblemIds != null ? relatedProblemIds : new ArrayList<>();
    }

    public List<String> getRelatedCompanyIds() { return relatedCompanyIds; }
    public void setRelatedCompanyIds(List<String> relatedCompanyIds) {
        this.relatedCompanyIds = relatedCompanyIds != null ? relatedCompanyIds : new ArrayList<>();
    }

    public List<String> getSourceUrls() { return sourceUrls; }
    public void setSourceUrls(List<String> sourceUrls) {
        this.sourceUrls = sourceUrls != null ? sourceUrls : new ArrayList<>();
    }

    public boolean isFavourite() { return favourite; }
    public void setFavourite(boolean favourite) { this.favourite = favourite; }

    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }

    public String getRevisionDate() { return revisionDate; }
    public void setRevisionDate(String revisionDate) { this.revisionDate = revisionDate; }

    public NoteStatus getStatus() { return status; }
    public void setStatus(NoteStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
