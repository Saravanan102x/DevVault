package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.Tag;
import com.techdiary.repository.TagRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonTagRepository implements TagRepository {

    private static final String FILE = "tags.json";
    private static final TypeReference<List<Tag>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonTagRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public Tag save(Tag tag) {
        List<Tag> all = storage.readList(FILE, TYPE);
        all.removeIf(t -> t.getId().equals(tag.getId()));
        all.add(tag);
        storage.writeList(FILE, all);
        return tag;
    }

    @Override
    public Optional<Tag> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(t -> t.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<Tag> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<Tag> all = storage.readList(FILE, TYPE);
        all.removeIf(t -> t.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(t -> t.getId().equals(id));
    }

    @Override
    public Optional<Tag> findByName(String normalizedName) {
        return storage.readList(FILE, TYPE).stream()
                .filter(t -> normalizedName.equals(t.getName()))
                .findFirst();
    }

    @Override
    public List<Tag> findByCategory(Tag.TagCategory category) {
        return storage.readList(FILE, TYPE).stream()
                .filter(t -> category.equals(t.getCategory()))
                .collect(Collectors.toList());
    }

    @Override
    public Tag findOrCreate(String displayName) {
        String normalized = displayName.toLowerCase().trim();
        return findByName(normalized).orElseGet(() -> {
            Tag tag = new Tag();
            tag.setId(UUID.randomUUID().toString());
            tag.setName(normalized);
            tag.setDisplayName(displayName.trim());
            tag.setCategory(Tag.TagCategory.CUSTOM);
            tag.setCreatedAt(Instant.now());
            return save(tag);
        });
    }
}
