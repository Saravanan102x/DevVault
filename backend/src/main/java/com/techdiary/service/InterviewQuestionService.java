package com.techdiary.service;

import com.techdiary.exception.ResourceNotFoundException;
import com.techdiary.model.InterviewQuestion;
import com.techdiary.repository.InterviewQuestionRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewQuestionService {

    private final InterviewQuestionRepository repository;

    public InterviewQuestionService(InterviewQuestionRepository repository) {
        this.repository = repository;
    }

    public List<InterviewQuestion> findAll() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(InterviewQuestion::getUpdatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public InterviewQuestion findById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InterviewQuestion", id));
    }

    public InterviewQuestion create(InterviewQuestion q) {
        q.setId(UUID.randomUUID().toString());
        q.setCreatedAt(Instant.now());
        q.setUpdatedAt(Instant.now());
        return repository.save(q);
    }

    public InterviewQuestion update(String id, InterviewQuestion updated) {
        InterviewQuestion existing = findById(id);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        return repository.save(updated);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("InterviewQuestion", id);
        }
        repository.deleteById(id);
    }

    public List<InterviewQuestion> findByCategory(InterviewQuestion.QuestionCategory category) {
        return repository.findByCategory(category);
    }

    public List<InterviewQuestion> findByFolder(String folder) {
        return repository.findByFolder(folder);
    }

    public List<InterviewQuestion> findByCompanyId(String companyId) {
        return repository.findByCompanyId(companyId);
    }

    public List<InterviewQuestion> search(String query) {
        return repository.search(query);
    }

    public List<String> getAllFolders() {
        return repository.findAll().stream()
                .map(InterviewQuestion::getFolder)
                .filter(f -> f != null && !f.isBlank())
                .distinct()
                .sorted()
                .toList();
    }
}
