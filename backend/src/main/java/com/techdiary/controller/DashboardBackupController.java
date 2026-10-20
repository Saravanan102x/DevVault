package com.techdiary.controller;

import com.techdiary.service.BackupService;
import com.techdiary.service.DashboardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1")
public class DashboardBackupController {

    private final DashboardService dashboardService;
    private final BackupService backupService;

    public DashboardBackupController(DashboardService dashboardService,
                                      BackupService backupService) {
        this.dashboardService = dashboardService;
        this.backupService = backupService;
    }

    @GetMapping("/dashboard/stats")
    public DashboardService.DashboardStats stats() {
        return dashboardService.getStats();
    }

    @PostMapping("/backup/export")
    public ResponseEntity<byte[]> export() throws IOException {
        byte[] data = backupService.export();
        String filename = "tech-diary-backup-" + LocalDate.now() + ".zip";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @PostMapping("/backup/import")
    public ResponseEntity<String> restore(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded backup file cannot be empty");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && !originalFilename.toLowerCase().endsWith(".zip")) {
            return ResponseEntity.badRequest().body("Only .zip backup archives are accepted");
        }
        if (file.getSize() > 20 * 1024 * 1024) { // 20 MB max file upload
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body("Backup file exceeds 20 MB size limit");
        }

        backupService.restore(file.getBytes());
        return ResponseEntity.ok("Restore complete. Restart the application to reload data.");
    }
}
