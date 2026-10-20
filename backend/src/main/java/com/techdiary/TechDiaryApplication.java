package com.techdiary;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TechDiaryApplication {

    public static void main(String[] args) {
        SpringApplication.run(TechDiaryApplication.class, args);
    }
}
