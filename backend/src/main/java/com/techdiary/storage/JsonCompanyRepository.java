package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.Company;
import com.techdiary.repository.CompanyRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonCompanyRepository implements CompanyRepository {

    private static final String FILE = "companies.json";
    private static final TypeReference<List<Company>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonCompanyRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public Company save(Company company) {
        List<Company> all = storage.readList(FILE, TYPE);
        all.removeIf(c -> c.getId().equals(company.getId()));
        all.add(company);
        storage.writeList(FILE, all);
        return company;
    }

    @Override
    public Optional<Company> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(c -> c.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<Company> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<Company> all = storage.readList(FILE, TYPE);
        all.removeIf(c -> c.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(c -> c.getId().equals(id));
    }

    @Override
    public Optional<Company> findBySlug(String slug) {
        return storage.readList(FILE, TYPE).stream()
                .filter(c -> slug.equals(c.getSlug()))
                .findFirst();
    }

    @Override
    public List<Company> findActive() {
        return storage.readList(FILE, TYPE).stream()
                .filter(c -> !c.isArchived())
                .sorted(Comparator.comparingInt(Company::getSortOrder))
                .collect(Collectors.toList());
    }
}
