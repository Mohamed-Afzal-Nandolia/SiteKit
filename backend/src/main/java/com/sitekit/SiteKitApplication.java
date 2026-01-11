package com.sitekit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.sitekit")
public class SiteKitApplication {

	public static void main(String[] args) {
		SpringApplication.run(SiteKitApplication.class, args);
	}

}
