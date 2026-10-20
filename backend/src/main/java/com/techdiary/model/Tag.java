package com.techdiary.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A reusable tag that can belong to any content type.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Tag {

    private String id;
    private String name;             // Normalized lowercase, trimmed
    private String displayName;      // Original casing
    private String color;            // HEX color for UI
    private TagCategory category;
    private Instant createdAt;

    public enum TagCategory { TOPIC, DIFFICULTY, LANGUAGE, COMPANY, CUSTOM }

    public Tag() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public TagCategory getCategory() { return category; }
    public void setCategory(TagCategory category) { this.category = category; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
