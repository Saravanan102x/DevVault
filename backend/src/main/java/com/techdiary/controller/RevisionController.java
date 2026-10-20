package com.techdiary.controller;

import com.techdiary.model.RevisionRecord;
import com.techdiary.service.RevisionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/revisions")
public class RevisionController {

    private final RevisionService revisionService;

    public RevisionController(RevisionService revisionService) {
        this.revisionService = revisionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RevisionRecord record(@RequestBody RevisionRecord record) {
        return revisionService.record(record);
    }

    @GetMapping("/entity/{entityId}")
    public List<RevisionRecord> byEntity(@PathVariable String entityId) {
        return revisionService.findByEntityId(entityId);
    }

    @GetMapping("/due-today")
    public List<RevisionRecord> dueToday() {
        return revisionService.findDueToday();
    }

    @GetMapping("/overdue")
    public List<RevisionRecord> overdue() {
        return revisionService.findOverdue();
    }

    @GetMapping("/upcoming")
    public List<RevisionRecord> upcoming(@RequestParam(defaultValue = "7") int days) {
        return revisionService.findUpcoming(days);
    }

    @GetMapping("/recent")
    public List<RevisionRecord> recent(@RequestParam(defaultValue = "10") int limit) {
        return revisionService.findRecentlyRevised(limit);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        revisionService.delete(id);
    }
}
