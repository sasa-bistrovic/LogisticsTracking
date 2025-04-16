package com.by.sasa.bistrovic.logistics.tracking;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
                    Dotenv dotenv = Dotenv.load();

        // Sastavi JDBC URL i postavi kao sistemsku varijablu
        String url = "jdbc:postgresql://" +
                     dotenv.get("DATABASE_HOST") + ":" +
                     dotenv.get("DATABASE_PORT") + "/" +
                     dotenv.get("DATABASE_NAME");
        System.setProperty("spring.datasource.url", url);
        System.setProperty("spring.datasource.username", dotenv.get("DATABASE_USERNAME"));
        System.setProperty("spring.datasource.password", dotenv.get("DATABASE_PASSWORD"));
        
            
		SpringApplication.run(Application.class, args);
	}

}
