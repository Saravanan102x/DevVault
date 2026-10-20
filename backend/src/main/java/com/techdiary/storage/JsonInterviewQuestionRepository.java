package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.InterviewQuestion;
import com.techdiary.repository.InterviewQuestionRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonInterviewQuestionRepository implements InterviewQuestionRepository {

    private static final String FILE = "interview-questions.json";
    private static final TypeReference<List<InterviewQuestion>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonInterviewQuestionRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public InterviewQuestion save(InterviewQuestion q) {
        List<InterviewQuestion> all = storage.readList(FILE, TYPE);
        all.removeIf(iq -> iq.getId().equals(q.getId()));
        all.add(q);
        storage.writeList(FILE, all);
        return q;
    }

    @Override
    public Optional<InterviewQuestion> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(q -> q.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<InterviewQuestion> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<InterviewQuestion> all = storage.readList(FILE, TYPE);
        all.removeIf(q -> q.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(q -> q.getId().equals(id));
    }

    @Override
    public List<InterviewQuestion> findByCategory(InterviewQuestion.QuestionCategory category) {
        return storage.readList(FILE, TYPE).stream()
                .filter(q -> category.equals(q.getCategory()))
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewQuestion> findByFolder(String folder) {
        return storage.readList(FILE, TYPE).stream()
                .filter(q -> folder.equalsIgnoreCase(q.getFolder()))
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewQuestion> findByCompanyId(String companyId) {
        return storage.readList(FILE, TYPE).stream()
                .filter(q -> q.getCompanyIds().contains(companyId))
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewQuestion> findByTag(String tag) {
        if (tag == null || tag.isBlank()) return Collections.emptyList();
        String normalized = tag.toLowerCase().trim();
        return storage.readList(FILE, TYPE).stream()
                .filter(q -> q.getTags() != null && q.getTags().stream()
                        .anyMatch(t -> t != null && t.toLowerCase().trim().equals(normalized)))
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewQuestion> findNeedingRevision() {
        return storage.readList(FILE, TYPE).stream()
                .filter(InterviewQuestion::isNeedsRevision)
                .collect(Collectors.toList());
    }

    @Override
    public List<InterviewQuestion> search(String query) {
        if (query == null || query.isBlank()) return Collections.emptyList();
        String q = query.toLowerCase().trim();
        return storage.readList(FILE, TYPE).stream()
                .filter(iq -> containsQuery(iq, q))
                .collect(Collectors.toList());
    }

    private boolean containsQuery(InterviewQuestion iq, String q) {
        if (iq.getQuestion() != null && iq.getQuestion().toLowerCase().contains(q)) return true;
        if (iq.getAnswer() != null && iq.getAnswer().toLowerCase().contains(q)) return true;
        return iq.getTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
    }
}
