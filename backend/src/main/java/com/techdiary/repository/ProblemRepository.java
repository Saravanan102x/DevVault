package com.techdiary.repository;

import com.techdiary.model.Problem;
import java.util.List;

public interface ProblemRepository extends CrudRepository<Problem, String> {
    List<Problem> findByType(Problem.ProblemType type);
    List<Problem> findByTag(String tag);
    List<Problem> findByDifficulty(Problem.Difficulty difficulty);
    List<Problem> findByStatus(Problem.ProblemStatus status);
    List<Problem> findByCompanyId(String companyId);
    List<Problem> search(String query);
    List<Problem> findNeedingRevision();
    List<Problem> filter(Problem.ProblemType type, Problem.Difficulty difficulty,
                         Problem.ProblemStatus status, String tag, String companyId);
}
