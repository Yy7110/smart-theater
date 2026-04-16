package com.smarttheater;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.smarttheater.mapper")
@EnableScheduling
public class SmartTheaterApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartTheaterApplication.class, args);
    }
}

