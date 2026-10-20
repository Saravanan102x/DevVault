package com.techdiary.repository;

import com.techdiary.model.Tag;
import java.util.List;
import java.util.Optional;

public interface TagRepository extends CrudRepository<Tag, String> {
    Optional<Tag> findByName(String normalizedName);
    List<Tag> findByCategory(Tag.TagCategory category);
    Tag findOrCreate(String displayName);
}
