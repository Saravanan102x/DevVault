package com.techdiary.service;

import com.techdiary.exception.ResourceNotFoundException;
import com.techdiary.model.Problem;
import com.techdiary.model.Solution;
import com.techdiary.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    public ProblemService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public List<Problem> findAll() {
        return problemRepository.findAll().stream()
                .sorted(Comparator.comparing(Problem::getUpdatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Problem findById(String id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", id));
    }

    public Problem create(Problem problem) {
        problem.setId(UUID.randomUUID().toString());
        problem.setCreatedAt(Instant.now());
        problem.setUpdatedAt(Instant.now());
        if (problem.getStatus() == null) problem.setStatus(Problem.ProblemStatus.NOT_STARTED);
        return problemRepository.save(problem);
    }

    public Problem update(String id, Problem updated) {
        Problem existing = findById(id);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        return problemRepository.save(updated);
    }

    public void delete(String id) {
        if (!problemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Problem", id);
        }
        problemRepository.deleteById(id);
    }

    public Problem addSolution(String problemId, Solution solution) {
        Problem problem = findById(problemId);
        solution.setId(UUID.randomUUID().toString());
        solution.setProblemId(problemId);
        solution.setCreatedAt(Instant.now());
        solution.setUpdatedAt(Instant.now());
        problem.getSolutions().add(solution);
        problem.setAttemptCount(problem.getAttemptCount() + 1);
        problem.setUpdatedAt(Instant.now());
        return problemRepository.save(problem);
    }

    public Problem updateSolution(String problemId, String solutionId, Solution updated) {
        Problem problem = findById(problemId);
        boolean found = false;
        for (int i = 0; i < problem.getSolutions().size(); i++) {
            if (problem.getSolutions().get(i).getId().equals(solutionId)) {
                updated.setId(solutionId);
                updated.setProblemId(problemId);
                updated.setCreatedAt(problem.getSolutions().get(i).getCreatedAt());
                updated.setUpdatedAt(Instant.now());
                problem.getSolutions().set(i, updated);
                found = true;
                break;
            }
        }
        if (!found) throw new ResourceNotFoundException("Solution", solutionId);
        problem.setUpdatedAt(Instant.now());
        return problemRepository.save(problem);
    }

    public Problem deleteSolution(String problemId, String solutionId) {
        Problem problem = findById(problemId);
        boolean removed = problem.getSolutions().removeIf(s -> s.getId().equals(solutionId));
        if (!removed) throw new ResourceNotFoundException("Solution", solutionId);
        problem.setUpdatedAt(Instant.now());
        return problemRepository.save(problem);
    }

    public List<Problem> filter(Problem.ProblemType type, Problem.Difficulty difficulty,
                                Problem.ProblemStatus status, String tag, String companyId) {
        return problemRepository.filter(type, difficulty, status, tag, companyId);
    }

    public List<Problem> search(String query) {
        return problemRepository.search(query);
    }

    public List<Problem> findByType(Problem.ProblemType type) {
        return problemRepository.findByType(type);
    }

    public List<Problem> findByCompanyId(String companyId) {
        return problemRepository.findByCompanyId(companyId);
    }

    public List<String> getAllTags() {
        return problemRepository.findAll().stream()
                .flatMap(p -> p.getTags().stream())
                .map(t -> t.toLowerCase().trim())
                .distinct()
                .sorted()
                .toList();
    }
}
