package com.techdiary.config;

import com.techdiary.service.CompanyService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Runs once at startup to seed default data if none exists.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private final CompanyService companyService;

    public DataSeeder(CompanyService companyService) {
        this.companyService = companyService;
    }

    @Override
    public void run(ApplicationArguments args) {
        companyService.seedDefaultCompanies();
    }
}
