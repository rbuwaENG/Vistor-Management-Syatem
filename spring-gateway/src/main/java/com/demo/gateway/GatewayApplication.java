package com.demo.gateway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@SpringBootApplication
@EnableEurekaClient
public class GatewayApplication {

    private static final Logger logger = LoggerFactory.getLogger(GatewayApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    public GlobalFilter loggingGlobalFilter() {
        return (exchange, chain) -> {
            String requestPath = exchange.getRequest().getPath().toString();
            String requestMethod = exchange.getRequest().getMethod().toString();
            String requestHeaders = exchange.getRequest().getHeaders().toString();
            logger.info("Request: {} {}, Headers: {}", requestMethod, requestPath, requestHeaders);

            ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(exchange.getResponse()) {
            };

            return chain.filter(exchange.mutate().response(decoratedResponse).build());
        };
    }

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-management-route", r -> r
                        .path("/api/users/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://USER-MANAGEMENT-SERVICE"))
                .route("microservice-two-route", r -> r
                        .path("/api/microservicetwo/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://MICROSERVICE-TWO"))
                .build();
    }
}