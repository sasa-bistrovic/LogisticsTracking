package com.by.sasa.bistrovic.logistics.tracking;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.CrossOriginOpenerPolicyHeaderWriter.CrossOriginOpenerPolicy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(new AntPathRequestMatcher("/auth/**")).permitAll()
                .anyRequest().permitAll() // Privremeno ili potpuno dozvolite ako nemate druge zaštićene rute za sada
            )
            .headers(headers -> headers
                .crossOriginOpenerPolicy(coop ->
                    coop.policy(
                        CrossOriginOpenerPolicy.SAME_ORIGIN_ALLOW_POPUPS
                    )
                )
            );

        return http.build();
    }
}