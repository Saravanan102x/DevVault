package com.techdiary.controller;

import com.techdiary.model.Company;
import com.techdiary.model.CompanyFolder;
import com.techdiary.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<Company> list(@RequestParam(defaultValue = "false") boolean includeArchived) {
        return includeArchived ? companyService.findAll() : companyService.findActive();
    }

    @GetMapping("/{id}")
    public Company getById(@PathVariable String id) {
        return companyService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Company create(@Valid @RequestBody Company company) {
        return companyService.create(company);
    }

    @PutMapping("/{id}")
    public Company update(@PathVariable String id, @Valid @RequestBody Company company) {
        return companyService.update(id, company);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        companyService.delete(id);
    }

    // --- Folders ---

    @GetMapping("/{id}/folders")
    public List<CompanyFolder> folders(@PathVariable String id) {
        return companyService.getFolders(id);
    }

    @PostMapping("/{id}/folders")
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyFolder createFolder(@PathVariable String id, @RequestBody CompanyFolder folder) {
        return companyService.createFolder(id, folder);
    }

    @PutMapping("/{id}/folders/{folderId}")
    public CompanyFolder updateFolder(@PathVariable String id,
                                       @PathVariable String folderId,
                                       @RequestBody CompanyFolder folder) {
        return companyService.updateFolder(folderId, folder);
    }

    @DeleteMapping("/{id}/folders/{folderId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFolder(@PathVariable String id, @PathVariable String folderId) {
        companyService.deleteFolder(folderId);
    }
}
