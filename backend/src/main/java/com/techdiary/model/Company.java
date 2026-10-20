package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a target company for interview preparation.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Company {

    private String id;

    @NotBlank(message = "Company name cannot be blank")
    private String name;
    private String slug;             // URL-safe identifier, e.g. "paypal"
    private String website;
    private String overview;         // Markdown
    private String logoUrl;
    private CompanyPriority priority = CompanyPriority.MEDIUM;
    private List<String> targetRoles = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private boolean archived;
    private int sortOrder;
    private Instant createdAt;
    private Instant updatedAt;

    public enum CompanyPriority { HIGH, MEDIUM, LOW }

    public Company() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public CompanyPriority getPriority() { return priority; }
    public void setPriority(CompanyPriority priority) { this.priority = priority; }

    public List<String> getTargetRoles() { return targetRoles; }
    public void setTargetRoles(List<String> targetRoles) {
        this.targetRoles = targetRoles != null ? targetRoles : new ArrayList<>();
    }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags != null ? tags : new ArrayList<>(); }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
