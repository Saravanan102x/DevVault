package com.techdiary.repository;

import com.techdiary.model.CompanyFolder;
import java.util.List;

public interface CompanyFolderRepository extends CrudRepository<CompanyFolder, String> {
    List<CompanyFolder> findByCompanyId(String companyId);
    List<CompanyFolder> findRootFolders(String companyId);
    List<CompanyFolder> findChildren(String parentId);
}
