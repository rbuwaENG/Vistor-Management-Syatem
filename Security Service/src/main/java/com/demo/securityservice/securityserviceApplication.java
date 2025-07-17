package com.demo.securityservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@SpringBootApplication
@EnableEurekaClient
public class securityserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(securityserviceApplication.class, args);
	}

}
