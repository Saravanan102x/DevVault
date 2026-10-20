package com.techdiary.controller;

import com.techdiary.model.JournalEntry;
import com.techdiary.service.JournalService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/journal")
public class JournalController {

    private final JournalService journalService;

    public JournalController(JournalService journalService) {
        this.journalService = journalService;
    }

    @GetMapping
    public List<JournalEntry> list(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) Integer recent) {

        if (from != null && to != null) return journalService.findByDateRange(from, to);
        if (recent != null) return journalService.findRecent(recent);
        return journalService.findAll();
    }

    @GetMapping("/today")
    public JournalEntry today() {
        return journalService.findOrCreateToday();
    }

    @GetMapping("/{id}")
    public JournalEntry getById(@PathVariable String id) {
        return journalService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JournalEntry create(@RequestBody JournalEntry entry) {
        return journalService.create(entry);
    }

    @PutMapping("/{id}")
    public JournalEntry update(@PathVariable String id, @RequestBody JournalEntry entry) {
        return journalService.update(id, entry);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        journalService.delete(id);
    }
}
