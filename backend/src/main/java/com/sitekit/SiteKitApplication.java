package com.sitekit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.sitekit")
@EnableScheduling
public class SiteKitApplication {

	public static void main(String[] args) {
		SpringApplication.run(SiteKitApplication.class, args);
	}

}
