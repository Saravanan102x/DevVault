package com.techdiary.controller;

import com.techdiary.model.Problem;
import com.techdiary.model.Solution;
import com.techdiary.service.ProblemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/problems")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping
    public List<Problem> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String q) {

        if (q != null && !q.isBlank()) return problemService.search(q);

        Problem.ProblemType typeEnum = parseEnum(Problem.ProblemType.class, type);
        Problem.Difficulty diffEnum = parseEnum(Problem.Difficulty.class, difficulty);
        Problem.ProblemStatus statusEnum = parseEnum(Problem.ProblemStatus.class, status);

        boolean hasFilter = typeEnum != null || diffEnum != null || statusEnum != null
                || (tag != null && !tag.isBlank()) || (companyId != null && !companyId.isBlank());

        if (hasFilter) {
            return problemService.filter(typeEnum, diffEnum, statusEnum, tag, companyId);
        }
        return problemService.findAll();
    }

    @GetMapping("/{id}")
    public Problem getById(@PathVariable String id) {
        return problemService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Problem create(@Valid @RequestBody Problem problem) {
        return problemService.create(problem);
    }

    @PutMapping("/{id}")
    public Problem update(@PathVariable String id, @Valid @RequestBody Problem problem) {
        return problemService.update(id, problem);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        problemService.delete(id);
    }

    @PostMapping("/{id}/solutions")
    @ResponseStatus(HttpStatus.CREATED)
    public Problem addSolution(@PathVariable String id, @RequestBody Solution solution) {
        return problemService.addSolution(id, solution);
    }

    @PutMapping("/{id}/solutions/{solutionId}")
    public Problem updateSolution(@PathVariable String id,
                                   @PathVariable String solutionId,
                                   @RequestBody Solution solution) {
        return problemService.updateSolution(id, solutionId, solution);
    }

    @DeleteMapping("/{id}/solutions/{solutionId}")
    public Problem deleteSolution(@PathVariable String id, @PathVariable String solutionId) {
        return problemService.deleteSolution(id, solutionId);
    }

    @GetMapping("/tags")
    public List<String> tags() {
        return problemService.getAllTags();
    }

    private <E extends Enum<E>> E parseEnum(Class<E> clazz, String value) {
        if (value == null || value.isBlank()) return null;
        try { return Enum.valueOf(clazz, value.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }
}
