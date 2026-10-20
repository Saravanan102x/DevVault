package com.techdiary.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techdiary.model.Company;
import com.techdiary.model.Note;
import com.techdiary.model.Problem;
import com.techdiary.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ValidationAndSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SearchService searchService;

    @Test
    void testCreateNoteWithBlankTitleReturnsBadRequest() throws Exception {
        Note invalidNote = new Note();
        invalidNote.setTitle(""); // Blank title violates @NotBlank
        invalidNote.setContent("Some test content");

        mockMvc.perform(post("/api/v1/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidNote)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void testCreateProblemWithBlankTitleReturnsBadRequest() throws Exception {
        Problem invalidProblem = new Problem();
        invalidProblem.setTitle("   "); // Whitespace only

        mockMvc.perform(post("/api/v1/problems")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidProblem)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void testCreateCompanyWithBlankNameReturnsBadRequest() throws Exception {
        Company invalidCompany = new Company();
        invalidCompany.setName("");

        mockMvc.perform(post("/api/v1/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidCompany)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    void testEmptyBackupUploadReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/backup/import"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSearchNullQueryDoesNotThrowNPE() {
        SearchService.SearchResult result = searchService.search(null, null);
        assertNotNull(result);
        assertEquals(0, result.getTotalCount());

        SearchService.SearchResult emptyResult = searchService.search("   ", null);
        assertNotNull(emptyResult);
        assertEquals(0, emptyResult.getTotalCount());
    }
}
