package com.techdiary.controller;

import com.techdiary.model.InterviewQuestion;
import com.techdiary.service.InterviewQuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interview-questions")
public class InterviewQuestionController {

    private final InterviewQuestionService service;

    public InterviewQuestionController(InterviewQuestionService service) {
        this.service = service;
    }

    @GetMapping
    public List<InterviewQuestion> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String q) {

        if (q != null && !q.isBlank()) return service.search(q);
        if (category != null && !category.isBlank()) {
            try {
                return service.findByCategory(
                        InterviewQuestion.QuestionCategory.valueOf(category.toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (folder != null && !folder.isBlank()) return service.findByFolder(folder);
        if (companyId != null && !companyId.isBlank()) return service.findByCompanyId(companyId);
        return service.findAll();
    }

    @GetMapping("/{id}")
    public InterviewQuestion getById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewQuestion create(@Valid @RequestBody InterviewQuestion q) {
        return service.create(q);
    }

    @PutMapping("/{id}")
    public InterviewQuestion update(@PathVariable String id, @Valid @RequestBody InterviewQuestion q) {
        return service.update(id, q);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @GetMapping("/folders")
    public List<String> folders() {
        return service.getAllFolders();
    }
}
