package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.Problem;
import com.techdiary.repository.ProblemRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonProblemRepository implements ProblemRepository {

    private static final String FILE = "problems.json";
    private static final TypeReference<List<Problem>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonProblemRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public Problem save(Problem problem) {
        List<Problem> all = storage.readList(FILE, TYPE);
        all.removeIf(p -> p.getId().equals(problem.getId()));
        all.add(problem);
        storage.writeList(FILE, all);
        return problem;
    }

    @Override
    public Optional<Problem> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<Problem> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<Problem> all = storage.readList(FILE, TYPE);
        all.removeIf(p -> p.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(p -> p.getId().equals(id));
    }

    @Override
    public List<Problem> findByType(Problem.ProblemType type) {
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> type.equals(p.getType()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Problem> findByTag(String tag) {
        if (tag == null || tag.isBlank()) return Collections.emptyList();
        String normalized = tag.toLowerCase().trim();
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> p.getTags() != null && p.getTags().stream()
                        .anyMatch(t -> t != null && t.toLowerCase().trim().equals(normalized)))
                .collect(Collectors.toList());
    }

    @Override
    public List<Problem> findByDifficulty(Problem.Difficulty difficulty) {
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> difficulty.equals(p.getDifficulty()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Problem> findByStatus(Problem.ProblemStatus status) {
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> status.equals(p.getStatus()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Problem> findByCompanyId(String companyId) {
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> p.getCompanyIds() != null && p.getCompanyIds().contains(companyId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Problem> search(String query) {
        if (query == null || query.isBlank()) return Collections.emptyList();
        String q = query.toLowerCase().trim();
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> containsQuery(p, q))
                .collect(Collectors.toList());
    }

    @Override
    public List<Problem> findNeedingRevision() {
        return storage.readList(FILE, TYPE).stream()
                .filter(Problem::isNeedsRevision)
                .collect(Collectors.toList());
    }

    @Override
    public List<Problem> filter(Problem.ProblemType type, Problem.Difficulty difficulty,
                                Problem.ProblemStatus status, String tag, String companyId) {
        return storage.readList(FILE, TYPE).stream()
                .filter(p -> type == null || type.equals(p.getType()))
                .filter(p -> difficulty == null || difficulty.equals(p.getDifficulty()))
                .filter(p -> status == null || status.equals(p.getStatus()))
                .filter(p -> tag == null || p.getTags().stream()
                        .anyMatch(t -> t.toLowerCase().trim().equals(tag.toLowerCase().trim())))
                .filter(p -> companyId == null || p.getCompanyIds().contains(companyId))
                .collect(Collectors.toList());
    }

    private boolean containsQuery(Problem p, String q) {
        if (p.getTitle() != null && p.getTitle().toLowerCase().contains(q)) return true;
        if (p.getStatement() != null && p.getStatement().toLowerCase().contains(q)) return true;
        if (p.getPersonalExplanation() != null && p.getPersonalExplanation().toLowerCase().contains(q)) return true;
        return p.getTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
    }
}
