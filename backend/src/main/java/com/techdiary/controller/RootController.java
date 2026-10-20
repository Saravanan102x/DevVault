package com.techdiary.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping
public class RootController {

    @GetMapping(value = {"/", "/api", "/api/v1"})
    public Map<String, Object> apiInfo() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("application", "Tech Diary API");
        info.put("status", "UP");
        info.put("version", "1.0.0");
        info.put("storage", "Local JSON Flat-File (No Database Required)");
        
        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("stats", "/api/v1/dashboard/stats");
        endpoints.put("notes", "/api/v1/notes");
        endpoints.put("problems", "/api/v1/problems");
        endpoints.put("companies", "/api/v1/companies");
        endpoints.put("interviewQuestions", "/api/v1/interview-questions");
        endpoints.put("revisionsDueToday", "/api/v1/revisions/due-today");
        endpoints.put("journalToday", "/api/v1/journal/today");
        endpoints.put("search", "/api/v1/search?q={keyword}");
        endpoints.put("backupExport", "/api/v1/backup/export");

        info.put("endpoints", endpoints);
        return info;
    }
}
