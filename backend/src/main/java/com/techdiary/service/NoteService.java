package com.techdiary.service;

import com.techdiary.exception.ResourceNotFoundException;
import com.techdiary.model.Note;
import com.techdiary.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> findAll() {
        return noteRepository.findAll().stream()
                .sorted(Comparator.comparing(Note::getUpdatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Note findById(String id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note", id));
    }

    public Note create(Note note) {
        note.setId(UUID.randomUUID().toString());
        note.setCreatedAt(Instant.now());
        note.setUpdatedAt(Instant.now());
        if (note.getStatus() == null) note.setStatus(Note.NoteStatus.ACTIVE);
        return noteRepository.save(note);
    }

    public Note update(String id, Note updated) {
        Note existing = findById(id);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        return noteRepository.save(updated);
    }

    public void delete(String id) {
        if (!noteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Note", id);
        }
        noteRepository.deleteById(id);
    }

    public List<Note> findByFolder(String folder) {
        return noteRepository.findByFolder(folder);
    }

    public List<Note> findByTag(String tag) {
        return noteRepository.findByTag(tag);
    }

    public List<Note> search(String query) {
        return noteRepository.search(query);
    }

    public List<Note> findFavourites() {
        return noteRepository.findFavourites();
    }

    public List<Note> findPinned() {
        return noteRepository.findPinned();
    }

    public Note toggleFavourite(String id) {
        Note note = findById(id);
        note.setFavourite(!note.isFavourite());
        note.setUpdatedAt(Instant.now());
        return noteRepository.save(note);
    }

    public Note togglePinned(String id) {
        Note note = findById(id);
        note.setPinned(!note.isPinned());
        note.setUpdatedAt(Instant.now());
        return noteRepository.save(note);
    }

    public List<String> getAllFolders() {
        return noteRepository.findAll().stream()
                .map(Note::getFolder)
                .filter(f -> f != null && !f.isBlank())
                .distinct()
                .sorted()
                .toList();
    }
}
