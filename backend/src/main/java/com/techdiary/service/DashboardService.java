package com.techdiary.service;

import com.techdiary.model.Note;
import com.techdiary.model.Problem;
import com.techdiary.model.RevisionRecord;
import com.techdiary.repository.JournalRepository;
import com.techdiary.repository.NoteRepository;
import com.techdiary.repository.ProblemRepository;
import com.techdiary.repository.RevisionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Computes dashboard statistics from real stored data.
 * Does not fabricate any numbers.
 */
@Service
public class DashboardService {

    private final ProblemRepository problemRepository;
    private final NoteRepository noteRepository;
    private final RevisionRepository revisionRepository;
    private final JournalRepository journalRepository;

    public DashboardService(ProblemRepository problemRepository,
                            NoteRepository noteRepository,
                            RevisionRepository revisionRepository,
                            JournalRepository journalRepository) {
        this.problemRepository = problemRepository;
        this.noteRepository = noteRepository;
        this.revisionRepository = revisionRepository;
        this.journalRepository = journalRepository;
    }

    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats();
        List<Problem> problems = problemRepository.findAll();
        List<Note> notes = noteRepository.findAll();

        // Problem counts
        stats.setTotalProblems(problems.size());
        stats.setSolvedProblems((int) problems.stream()
                .filter(p -> p.getStatus() == Problem.ProblemStatus.SOLVED).count());

        // Problems by difficulty
        Map<String, Long> byDifficulty = problems.stream()
                .filter(p -> p.getDifficulty() != null)
                .collect(Collectors.groupingBy(p -> p.getDifficulty().name(), Collectors.counting()));
        stats.setProblemsByDifficulty(byDifficulty);

        // Problems by topic (top tags)
        Map<String, Long> byTopic = problems.stream()
                .flatMap(p -> p.getTags().stream())
                .collect(Collectors.groupingBy(t -> t.toLowerCase().trim(), Collectors.counting()));
        stats.setProblemsByTopic(byTopic);

        // Today's and this week's activity
        String today = LocalDate.now().toString();
        String weekStart = LocalDate.now().minusDays(6).toString();

        long solvedToday = problems.stream()
                .filter(p -> p.getUpdatedAt() != null &&
                        p.getStatus() == Problem.ProblemStatus.SOLVED &&
                        p.getUpdatedAt().toString().startsWith(today.substring(0, 10)))
                .count();
        stats.setSolvedToday((int) solvedToday);

        long solvedThisWeek = problems.stream()
                .filter(p -> p.getUpdatedAt() != null &&
                        p.getStatus() == Problem.ProblemStatus.SOLVED &&
                        p.getUpdatedAt().toString().substring(0, 10).compareTo(weekStart) >= 0)
                .count();
        stats.setSolvedThisWeek((int) solvedThisWeek);

        // Notes
        stats.setTotalNotes(notes.size());

        // Revision due
        stats.setRevisionDueToday(revisionRepository.findDueToday().size());
        stats.setRevisionOverdue(revisionRepository.findOverdue().size());

        // Practice streak (count consecutive days with journal entries)
        stats.setPracticeStreak(calculateStreak());

        return stats;
    }

    private int calculateStreak() {
        List<String> dates = journalRepository.findAll().stream()
                .map(e -> e.getDate())
                .filter(d -> d != null)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .toList();

        if (dates.isEmpty()) return 0;
        int streak = 0;
        LocalDate expected = LocalDate.now();
        for (String date : dates) {
            LocalDate d = LocalDate.parse(date);
            if (d.equals(expected) || d.equals(expected.minusDays(1))) {
                streak++;
                expected = d.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    public static class DashboardStats {
        private int totalProblems;
        private int solvedProblems;
        private int solvedToday;
        private int solvedThisWeek;
        private int totalNotes;
        private int revisionDueToday;
        private int revisionOverdue;
        private int practiceStreak;
        private Map<String, Long> problemsByDifficulty;
        private Map<String, Long> problemsByTopic;

        // Getters and Setters
        public int getTotalProblems() { return totalProblems; }
        public void setTotalProblems(int totalProblems) { this.totalProblems = totalProblems; }
        public int getSolvedProblems() { return solvedProblems; }
        public void setSolvedProblems(int solvedProblems) { this.solvedProblems = solvedProblems; }
        public int getSolvedToday() { return solvedToday; }
        public void setSolvedToday(int solvedToday) { this.solvedToday = solvedToday; }
        public int getSolvedThisWeek() { return solvedThisWeek; }
        public void setSolvedThisWeek(int solvedThisWeek) { this.solvedThisWeek = solvedThisWeek; }
        public int getTotalNotes() { return totalNotes; }
        public void setTotalNotes(int totalNotes) { this.totalNotes = totalNotes; }
        public int getRevisionDueToday() { return revisionDueToday; }
        public void setRevisionDueToday(int revisionDueToday) { this.revisionDueToday = revisionDueToday; }
        public int getRevisionOverdue() { return revisionOverdue; }
        public void setRevisionOverdue(int revisionOverdue) { this.revisionOverdue = revisionOverdue; }
        public int getPracticeStreak() { return practiceStreak; }
        public void setPracticeStreak(int practiceStreak) { this.practiceStreak = practiceStreak; }
        public Map<String, Long> getProblemsByDifficulty() { return problemsByDifficulty; }
        public void setProblemsByDifficulty(Map<String, Long> m) { this.problemsByDifficulty = m; }
        public Map<String, Long> getProblemsByTopic() { return problemsByTopic; }
        public void setProblemsByTopic(Map<String, Long> m) { this.problemsByTopic = m; }
    }
}
