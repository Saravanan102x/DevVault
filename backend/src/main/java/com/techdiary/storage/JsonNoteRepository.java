package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.Note;
import com.techdiary.repository.NoteRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonNoteRepository implements NoteRepository {

    private static final String FILE = "notes.json";
    private static final TypeReference<List<Note>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonNoteRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public Note save(Note note) {
        List<Note> all = storage.readList(FILE, TYPE);
        all.removeIf(n -> n.getId().equals(note.getId()));
        all.add(note);
        storage.writeList(FILE, all);
        return note;
    }

    @Override
    public Optional<Note> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(n -> n.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<Note> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<Note> all = storage.readList(FILE, TYPE);
        all.removeIf(n -> n.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(n -> n.getId().equals(id));
    }

    @Override
    public List<Note> findByFolder(String folder) {
        return storage.readList(FILE, TYPE).stream()
                .filter(n -> folder.equalsIgnoreCase(n.getFolder()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Note> findByTag(String tag) {
        if (tag == null || tag.isBlank()) return Collections.emptyList();
        String normalized = tag.toLowerCase().trim();
        return storage.readList(FILE, TYPE).stream()
                .filter(n -> n.getTags() != null && n.getTags().stream()
                        .anyMatch(t -> t != null && t.toLowerCase().trim().equals(normalized)))
                .collect(Collectors.toList());
    }

    @Override
    public List<Note> search(String query) {
        if (query == null || query.isBlank()) return Collections.emptyList();
        String q = query.toLowerCase().trim();
        return storage.readList(FILE, TYPE).stream()
                .filter(n -> containsQuery(n, q))
                .collect(Collectors.toList());
    }

    @Override
    public List<Note> findFavourites() {
        return storage.readList(FILE, TYPE).stream()
                .filter(Note::isFavourite)
                .collect(Collectors.toList());
    }

    @Override
    public List<Note> findPinned() {
        return storage.readList(FILE, TYPE).stream()
                .filter(Note::isPinned)
                .collect(Collectors.toList());
    }

    @Override
    public List<Note> findNeedingRevision() {
        return storage.readList(FILE, TYPE).stream()
                .filter(n -> n.getRevisionDate() != null)
                .collect(Collectors.toList());
    }

    private boolean containsQuery(Note n, String q) {
        if (n.getTitle() != null && n.getTitle().toLowerCase().contains(q)) return true;
        if (n.getContent() != null && n.getContent().toLowerCase().contains(q)) return true;
        if (n.getFolder() != null && n.getFolder().toLowerCase().contains(q)) return true;
        return n.getTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
    }
}
