package com.techdiary.controller;

import com.techdiary.model.Note;
import com.techdiary.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<Note> list(
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean favourites,
            @RequestParam(required = false) Boolean pinned) {

        if (q != null && !q.isBlank()) return noteService.search(q);
        if (folder != null && !folder.isBlank()) return noteService.findByFolder(folder);
        if (tag != null && !tag.isBlank()) return noteService.findByTag(tag);
        if (Boolean.TRUE.equals(favourites)) return noteService.findFavourites();
        if (Boolean.TRUE.equals(pinned)) return noteService.findPinned();
        return noteService.findAll();
    }

    @GetMapping("/{id}")
    public Note getById(@PathVariable String id) {
        return noteService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Note create(@Valid @RequestBody Note note) {
        return noteService.create(note);
    }

    @PutMapping("/{id}")
    public Note update(@PathVariable String id, @Valid @RequestBody Note note) {
        return noteService.update(id, note);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        noteService.delete(id);
    }

    @PostMapping("/{id}/favourite")
    public Note toggleFavourite(@PathVariable String id) {
        return noteService.toggleFavourite(id);
    }

    @PostMapping("/{id}/pin")
    public Note togglePin(@PathVariable String id) {
        return noteService.togglePinned(id);
    }

    @GetMapping("/folders")
    public List<String> folders() {
        return noteService.getAllFolders();
    }
}
