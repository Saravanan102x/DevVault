package com.techdiary.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.techdiary.model.CompanyFolder;
import com.techdiary.repository.CompanyFolderRepository;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class JsonCompanyFolderRepository implements CompanyFolderRepository {

    private static final String FILE = "company-folders.json";
    private static final TypeReference<List<CompanyFolder>> TYPE = new TypeReference<>() {};

    private final JsonFileStorage storage;

    public JsonCompanyFolderRepository(JsonFileStorage storage) {
        this.storage = storage;
    }

    @Override
    public CompanyFolder save(CompanyFolder folder) {
        List<CompanyFolder> all = storage.readList(FILE, TYPE);
        all.removeIf(f -> f.getId().equals(folder.getId()));
        all.add(folder);
        storage.writeList(FILE, all);
        return folder;
    }

    @Override
    public Optional<CompanyFolder> findById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .filter(f -> f.getId().equals(id))
                .findFirst();
    }

    @Override
    public List<CompanyFolder> findAll() {
        return storage.readList(FILE, TYPE);
    }

    @Override
    public void deleteById(String id) {
        List<CompanyFolder> all = storage.readList(FILE, TYPE);
        all.removeIf(f -> f.getId().equals(id));
        storage.writeList(FILE, all);
    }

    @Override
    public boolean existsById(String id) {
        return storage.readList(FILE, TYPE).stream()
                .anyMatch(f -> f.getId().equals(id));
    }

    @Override
    public List<CompanyFolder> findByCompanyId(String companyId) {
        return storage.readList(FILE, TYPE).stream()
                .filter(f -> companyId.equals(f.getCompanyId()))
                .sorted(Comparator.comparingInt(CompanyFolder::getSortOrder))
                .collect(Collectors.toList());
    }

    @Override
    public List<CompanyFolder> findRootFolders(String companyId) {
        return storage.readList(FILE, TYPE).stream()
                .filter(f -> companyId.equals(f.getCompanyId()) && f.getParentId() == null)
                .sorted(Comparator.comparingInt(CompanyFolder::getSortOrder))
                .collect(Collectors.toList());
    }

    @Override
    public List<CompanyFolder> findChildren(String parentId) {
        return storage.readList(FILE, TYPE).stream()
                .filter(f -> parentId.equals(f.getParentId()))
                .sorted(Comparator.comparingInt(CompanyFolder::getSortOrder))
                .collect(Collectors.toList());
    }
}
