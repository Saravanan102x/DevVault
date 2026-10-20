package com.techdiary.service;

import com.techdiary.exception.ResourceNotFoundException;
import com.techdiary.model.Company;
import com.techdiary.model.CompanyFolder;
import com.techdiary.repository.CompanyFolderRepository;
import com.techdiary.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyFolderRepository folderRepository;

    public CompanyService(CompanyRepository companyRepository,
                          CompanyFolderRepository folderRepository) {
        this.companyRepository = companyRepository;
        this.folderRepository = folderRepository;
    }

    public List<Company> findAll() { return companyRepository.findAll(); }
    public List<Company> findActive() { return companyRepository.findActive(); }

    public Company findById(String id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", id));
    }

    public Company create(Company company) {
        company.setId(UUID.randomUUID().toString());
        company.setCreatedAt(Instant.now());
        company.setUpdatedAt(Instant.now());
        if (company.getSlug() == null || company.getSlug().isBlank()) {
            company.setSlug(toSlug(company.getName()));
        }
        return companyRepository.save(company);
    }

    public Company update(String id, Company updated) {
        Company existing = findById(id);
        updated.setId(existing.getId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        return companyRepository.save(updated);
    }

    public void delete(String id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company", id);
        }
        companyRepository.deleteById(id);
    }

    // --- Folders ---

    public List<CompanyFolder> getFolders(String companyId) {
        return folderRepository.findByCompanyId(companyId);
    }

    public List<CompanyFolder> getRootFolders(String companyId) {
        return folderRepository.findRootFolders(companyId);
    }

    public CompanyFolder createFolder(String companyId, CompanyFolder folder) {
        folder.setId(UUID.randomUUID().toString());
        folder.setCompanyId(companyId);
        folder.setCreatedAt(Instant.now());
        folder.setUpdatedAt(Instant.now());
        return folderRepository.save(folder);
    }

    public CompanyFolder updateFolder(String folderId, CompanyFolder updated) {
        CompanyFolder existing = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyFolder", folderId));
        updated.setId(existing.getId());
        updated.setCompanyId(existing.getCompanyId());
        updated.setCreatedAt(existing.getCreatedAt());
        updated.setUpdatedAt(Instant.now());
        return folderRepository.save(updated);
    }

    public void deleteFolder(String folderId) {
        if (!folderRepository.existsById(folderId)) {
            throw new ResourceNotFoundException("CompanyFolder", folderId);
        }
        folderRepository.deleteById(folderId);
    }

    /** Seed the five target companies if none exist. */
    public void seedDefaultCompanies() {
        if (!companyRepository.findAll().isEmpty()) return;
        String[][] defaults = {
            {"PayPal", "paypal", "https://paypal.com"},
            {"Walmart Global Tech", "walmart-global-tech", "https://walmart.com"},
            {"Freshworks", "freshworks", "https://freshworks.com"},
            {"Chargebee", "chargebee", "https://chargebee.com"},
            {"Comcast", "comcast", "https://comcast.com"}
        };
        for (int i = 0; i < defaults.length; i++) {
            Company c = new Company();
            c.setName(defaults[i][0]);
            c.setSlug(defaults[i][1]);
            c.setWebsite(defaults[i][2]);
            c.setPriority(i == 0 ? Company.CompanyPriority.HIGH : Company.CompanyPriority.MEDIUM);
            c.setSortOrder(i);
            create(c);
        }
    }

    private String toSlug(String name) {
        return name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-");
    }
}
