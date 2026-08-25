package com.setec.operation_service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class OperationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OperationServiceApplication.class, args);
	}

	@Bean
	public CommandLineRunner dropTypeColumnRunner(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE products DROP COLUMN IF EXISTS type;");
				jdbcTemplate.execute("ALTER TABLE products ALTER COLUMN image TYPE TEXT;");
				System.out.println("Successfully executed DDL updates for products table.");
			} catch (Exception e) {
				System.err.println("Failed to run DDL updates: " + e.getMessage());
			}
		};
	}

}
