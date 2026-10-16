package com.app.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI api() {
        return new OpenAPI()
                .info(new Info()
                        .title("Mercado de Jogadores API")
                        .description("API REST do estudo de caso SENAI/PE - Desenvolvedor Fullstack I.")
                        .version("v1"));
    }
}
