package com.techdiary.repository;

import com.techdiary.model.Company;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends CrudRepository<Company, String> {
    Optional<Company> findBySlug(String slug);
    List<Company> findActive();
}
