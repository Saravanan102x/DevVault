package com.techdiary.service;

import com.techdiary.model.Note;
import com.techdiary.model.Problem;
import com.techdiary.model.InterviewQuestion;
import com.techdiary.repository.NoteRepository;
import com.techdiary.repository.ProblemRepository;
import com.techdiary.repository.InterviewQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Cross-entity search service.
 */
@Service
public class SearchService {

    private final NoteRepository noteRepository;
    private final ProblemRepository problemRepository;
    private final InterviewQuestionRepository questionRepository;

    public SearchService(NoteRepository noteRepository,
                         ProblemRepository problemRepository,
                         InterviewQuestionRepository questionRepository) {
        this.noteRepository = noteRepository;
        this.problemRepository = problemRepository;
        this.questionRepository = questionRepository;
    }

    public SearchResult search(String query, List<String> types) {
        SearchResult result = new SearchResult();
        if (query == null || query.isBlank()) {
            return result;
        }

        boolean searchAll = types == null || types.isEmpty();

        if (searchAll || types.contains("NOTE")) {
            result.setNotes(noteRepository.search(query));
        }
        if (searchAll || types.contains("PROBLEM")) {
            result.setProblems(problemRepository.search(query));
        }
        if (searchAll || types.contains("INTERVIEW_QUESTION")) {
            result.setQuestions(questionRepository.search(query));
        }

        result.setTotalCount(
                result.getNotes().size() +
                result.getProblems().size() +
                result.getQuestions().size()
        );
        return result;
    }

    public static class SearchResult {
        private List<Note> notes = new ArrayList<>();
        private List<Problem> problems = new ArrayList<>();
        private List<InterviewQuestion> questions = new ArrayList<>();
        private int totalCount;

        public List<Note> getNotes() { return notes; }
        public void setNotes(List<Note> notes) { this.notes = notes; }

        public List<Problem> getProblems() { return problems; }
        public void setProblems(List<Problem> problems) { this.problems = problems; }

        public List<InterviewQuestion> getQuestions() { return questions; }
        public void setQuestions(List<InterviewQuestion> questions) { this.questions = questions; }

        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
    }
}
