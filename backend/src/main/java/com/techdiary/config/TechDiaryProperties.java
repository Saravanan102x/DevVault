package com.techdiary.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "techdiary")
public record TechDiaryProperties(
        DataConfig data,
        BackupConfig backup
) {
    public record DataConfig(String directory) {}
    public record BackupConfig(String directory) {}
}
