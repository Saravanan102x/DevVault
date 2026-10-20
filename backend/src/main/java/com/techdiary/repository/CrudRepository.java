package com.techdiary.repository;

import java.util.List;
import java.util.Optional;

/**
 * Base repository abstraction.
 * The JSON implementation satisfies this; a JPA implementation can replace it later.
 */
public interface CrudRepository<T, ID> {
    T save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void deleteById(ID id);
    boolean existsById(ID id);
}
