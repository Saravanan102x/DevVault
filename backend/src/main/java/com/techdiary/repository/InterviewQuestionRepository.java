package com.techdiary.repository;

import com.techdiary.model.InterviewQuestion;
import java.util.List;

public interface InterviewQuestionRepository extends CrudRepository<InterviewQuestion, String> {
    List<InterviewQuestion> findByCategory(InterviewQuestion.QuestionCategory category);
    List<InterviewQuestion> findByFolder(String folder);
    List<InterviewQuestion> findByCompanyId(String companyId);
    List<InterviewQuestion> findByTag(String tag);
    List<InterviewQuestion> findNeedingRevision();
    List<InterviewQuestion> search(String query);
}
