package com.techdiary.controller;

import com.techdiary.service.SearchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public SearchService.SearchResult search(
            @RequestParam String q,
            @RequestParam(required = false) List<String> types) {
        return searchService.search(q, types);
    }
}
