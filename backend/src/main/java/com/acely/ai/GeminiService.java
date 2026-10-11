package com.acely.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Service
public class GeminiService {

    private final RestClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${gemini.api-key}")
    String key;

    @Value("${gemini.model}")
    String model;

    public GeminiService() {
        this.client = RestClient.builder()
                .requestFactory(createRequestFactory())
                .build();
    }

    private org.springframework.http.client.SimpleClientHttpRequestFactory createRequestFactory() {
        var factory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();

        // Do not allow Gemini to block the application for a long time.
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(20));

        return factory;
    }

    public JsonNode generate(String instruction, String material) {

        if (key == null || key.isBlank()) {
            throw new IllegalStateException(
                    "AI generation is not configured. Please configure GEMINI_API_KEY."
            );
        }

        String safeMaterial = material == null ? "" : material;

        String prompt = instruction
                + "\n\nStudy material (use only this material):\n"
                + safeMaterial.substring(
                        0,
                        Math.min(safeMaterial.length(), 60000)
                );

        var body = mapper.createObjectNode();

        var parts = body
                .putArray("contents")
                .addObject()
                .putArray("parts");

        parts.addObject()
                .put("text", prompt);

        try {

            System.out.println("Sending request to Gemini...");

            String raw = client.post()
                    .uri(
                            "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}",
                            model,
                            key
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            if (raw == null || raw.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty response."
                );
            }

            JsonNode response = mapper.readTree(raw);

            String text = response
                    .path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

            if (text == null || text.isBlank()) {
                throw new IllegalStateException(
                        "Gemini returned an empty response."
                );
            }

            System.out.println("Gemini response received successfully.");

            return parseJson(text);

        } catch (Exception e) {

            System.out.println(
                    "Gemini unavailable: " + e.getMessage()
            );

            /*
             * Important:
             *
             * Do NOT retry here.
             *
             * DocumentService catches this exception and uses
             * FallbackContentGenerator to generate the resources locally.
             */
            throw new IllegalStateException(
                    "Gemini is temporarily unavailable. Using local resource generation.",
                    e
            );
        }
    }

    private JsonNode parseJson(String text) throws Exception {

        String cleaned = text
                .replaceAll(
                        "(?s)^\\s*```(?:json)?\\s*|\\s*```\\s*$",
                        ""
                )
                .trim();

        JsonNode node = mapper.readTree(cleaned);

        if (node == null || node.isMissingNode()) {
            throw new IllegalArgumentException(
                    "The AI returned an invalid response."
            );
        }

        return node;
    }
}