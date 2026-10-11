package com.acely.document;

import com.acely.ai.GeminiService;
import com.acely.user.User;
import com.acely.user.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {

    private final DocumentRepository repo;
    private final UserRepository userRepository;
    private final TextExtractor extractor;
    private final GeminiService gemini;
    private final FallbackContentGenerator fallback;
    private final ObjectMapper mapper = new ObjectMapper();

    public DocumentService(
            DocumentRepository repo,
            UserRepository userRepository,
            TextExtractor extractor,
            GeminiService gemini,
            FallbackContentGenerator fallback
    ) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.extractor = extractor;
        this.gemini = gemini;
        this.fallback = fallback;
    }

    // =========================================================
    // GET CURRENT USER
    // =========================================================

    private User currentUser(String email) {

        if (email == null || email.isBlank()) {
            throw new IllegalStateException(
                    "You must be logged in."
            );
        }

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Logged-in user was not found."
                        )
                );
    }

    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    @Transactional
    public Document upload(
            MultipartFile file,
            String email
    ) throws Exception {

        User user = currentUser(email);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please choose a non-empty file."
            );
        }

        String name = Optional
                .ofNullable(file.getOriginalFilename())
                .orElse("material");

        if (!name.matches(
                "(?i).+\\.(pdf|docx|pptx|txt)$"
        )) {

            throw new IllegalArgumentException(
                    "Supported files are PDF, DOCX, PPTX, and TXT."
            );
        }

        Document d = new Document();

        // IMPORTANT:
        // Attach this material to the logged-in user.
        d.user = user;

        d.fileName = name;

        d.fileType = name
                .substring(name.lastIndexOf('.') + 1)
                .toUpperCase();

        d.fileSize = file.getSize();

        d.status = Document.Status.PROCESSING;

        d = repo.save(d);

        try {

            d.extractedText = extractor
                    .extract(file)
                    .replaceAll("\\s+", " ")
                    .trim();

            if (d.extractedText.length() < 20) {

                throw new IllegalArgumentException(
                        "Unable to process this document. "
                                + "Please make sure it contains readable text."
                );
            }

            d.status = Document.Status.UPLOADED;

            return repo.save(d);

        } catch (Exception ex) {

            d.status = Document.Status.FAILED;

            repo.save(d);

            throw ex;
        }
    }

    // =========================================================
    // GENERATE ALL RESOURCES
    // =========================================================

    @Transactional
    public void generateAll(
            long id,
            String email
    ) {

        Document d = get(id, email);

        if (d.extractedText == null
                || d.extractedText.isBlank()) {

            throw new IllegalArgumentException(
                    "This document has no readable text."
            );
        }

        if (hasAllResources(d)) {

            System.out.println(
                    "All resources already exist in MySQL. "
                            + "Using cached content."
            );

            d.status = Document.Status.READY;

            repo.save(d);

            return;
        }

        d.status = Document.Status.PROCESSING;

        repo.save(d);

        try {

            System.out.println(
                    "Trying Gemini AI for document: "
                            + d.fileName
            );

            Map<String, JsonNode> aiResult =
                    generateAllWithGemini(
                            d.extractedText
                    );

            saveAllResources(
                    d,
                    aiResult.get("notes"),
                    aiResult.get("flashcards"),
                    aiResult.get("quiz"),
                    aiResult.get("mindmap")
            );

            d.status = Document.Status.READY;

            repo.save(d);

            System.out.println(
                    "Gemini successfully generated all resources."
            );

        } catch (Exception geminiError) {

            System.out.println(
                    "Gemini unavailable."
            );

            System.out.println(
                    "Reason: "
                            + geminiError.getMessage()
            );

            System.out.println(
                    "Switching to local fallback generator..."
            );

            try {

                Map<String, JsonNode> fallbackResult =
                        fallback.generateAll(
                                d.extractedText
                        );

                saveAllResources(
                        d,
                        fallbackResult.get("notes"),
                        fallbackResult.get("flashcards"),
                        fallbackResult.get("quiz"),
                        fallbackResult.get("mindmap")
                );

                d.status = Document.Status.READY;

                repo.save(d);

                System.out.println(
                        "Fallback generation completed successfully."
                );

            } catch (Exception fallbackError) {

                d.status = Document.Status.FAILED;

                repo.save(d);

                throw new IllegalStateException(
                        "Unable to generate study resources. "
                                + "Gemini and fallback generation failed."
                );
            }
        }
    }

    // =========================================================
    // REGENERATE ALL RESOURCES
    // =========================================================

    @Transactional
    public void regenerateAll(
            long id,
            String email
    ) {

        Document d = get(id, email);

        if (d.extractedText == null
                || d.extractedText.isBlank()) {

            throw new IllegalArgumentException(
                    "This document has no readable text."
            );
        }

        System.out.println(
                "Regenerating all resources for: "
                        + d.fileName
        );

        d.notesJson = null;
        d.flashcardsJson = null;
        d.quizJson = null;
        d.mindMapJson = null;

        d.status = Document.Status.PROCESSING;

        repo.save(d);

        try {

            System.out.println(
                    "Trying Gemini AI for regeneration..."
            );

            Map<String, JsonNode> aiResult =
                    generateAllWithGemini(
                            d.extractedText
                    );

            saveAllResources(
                    d,
                    aiResult.get("notes"),
                    aiResult.get("flashcards"),
                    aiResult.get("quiz"),
                    aiResult.get("mindmap")
            );

            d.status = Document.Status.READY;

            repo.save(d);

            System.out.println(
                    "Regeneration completed using Gemini."
            );

        } catch (Exception geminiError) {

            System.out.println(
                    "Gemini unavailable during regeneration."
            );

            System.out.println(
                    "Reason: "
                            + geminiError.getMessage()
            );

            try {

                Map<String, JsonNode> fallbackResult =
                        fallback.generateAll(
                                d.extractedText
                        );

                saveAllResources(
                        d,
                        fallbackResult.get("notes"),
                        fallbackResult.get("flashcards"),
                        fallbackResult.get("quiz"),
                        fallbackResult.get("mindmap")
                );

                d.status = Document.Status.READY;

                repo.save(d);

                System.out.println(
                        "Regeneration completed using fallback generator."
                );

            } catch (Exception fallbackError) {

                d.status = Document.Status.FAILED;

                repo.save(d);

                throw new IllegalStateException(
                        "Unable to regenerate study resources. "
                                + "Gemini and fallback generation failed."
                );
            }
        }
    }

    // =========================================================
    // GENERATE INDIVIDUAL RESOURCE
    // =========================================================

    @Transactional
    public JsonNode generate(
            long id,
            String type,
            String email
    ) {

        Document d = get(id, email);

        if (d.extractedText == null
                || d.extractedText.isBlank()) {

            throw new IllegalArgumentException(
                    "This document has no readable text."
            );
        }

        JsonNode existing =
                resource(id, type, email);

        if (existing != null) {

            System.out.println(
                    "Using cached "
                            + type
                            + " from MySQL."
            );

            return existing;
        }

        d.status = Document.Status.PROCESSING;

        repo.save(d);

        try {

            Map<String, JsonNode> aiResult =
                    generateAllWithGemini(
                            d.extractedText
                    );

            saveAllResources(
                    d,
                    aiResult.get("notes"),
                    aiResult.get("flashcards"),
                    aiResult.get("quiz"),
                    aiResult.get("mindmap")
            );

            d.status = Document.Status.READY;

            repo.save(d);

            return getResourceFromResult(
                    aiResult,
                    type
            );

        } catch (Exception geminiError) {

            System.out.println(
                    "Gemini unavailable for "
                            + type
                            + "."
            );

            System.out.println(
                    "Switching to fallback generator..."
            );

            try {

                Map<String, JsonNode> fallbackResult =
                        fallback.generateAll(
                                d.extractedText
                        );

                saveAllResources(
                        d,
                        fallbackResult.get("notes"),
                        fallbackResult.get("flashcards"),
                        fallbackResult.get("quiz"),
                        fallbackResult.get("mindmap")
                );

                d.status = Document.Status.READY;

                repo.save(d);

                return getResourceFromResult(
                        fallbackResult,
                        type
                );

            } catch (Exception fallbackError) {

                d.status = Document.Status.FAILED;

                repo.save(d);

                throw new IllegalStateException(
                        "Unable to generate "
                                + type
                                + "."
                );
            }
        }
    }

    // =========================================================
    // ONE GEMINI CALL FOR ALL RESOURCES
    // =========================================================

    private Map<String, JsonNode> generateAllWithGemini(
            String material
    ) {

        String instruction = """
                You are an educational assistant.

                Analyze ONLY the supplied study material.

                Do not invent unrelated information.

                Generate all four educational resources.

                Return JSON ONLY.

                Required JSON structure:

                {
                  "notes": {
                    "title": "string",
                    "overview": "string",
                    "keyPoints": ["string"],
                    "definitions": [
                      {
                        "term": "string",
                        "meaning": "string"
                      }
                    ],
                    "examTips": ["string"]
                  },

                  "flashcards": {
                    "flashcards": [
                      {
                        "question": "string",
                        "answer": "string",
                        "difficulty": "Easy"
                      }
                    ]
                  },

                  "quiz": {
                    "questions": [
                      {
                        "question": "string",
                        "options": [
                          "string",
                          "string",
                          "string",
                          "string"
                        ],
                        "correctAnswer": "string",
                        "explanation": "string",
                        "difficulty": "Easy"
                      }
                    ]
                  },

                  "mindmap": {
                    "topic": "string",
                    "nodes": [
                      {
                        "id": "string",
                        "label": "string",
                        "type": "root"
                      }
                    ],
                    "edges": [
                      {
                        "source": "string",
                        "target": "string"
                      }
                    ]
                  }
                }

                Requirements:

                - Create useful study notes.
                - Create 10-20 flashcards.
                - Create exactly 10 quiz questions.
                - Each quiz question must have exactly 4 options.
                - Create a meaningful mind map.
                - Use only information from the supplied material.
                - Make flashcard questions varied and specific.
                - Do not repeat the same flashcard question.
                - Make quiz questions varied and specific.
                - Do not repeat the same quiz question.
                - Return valid JSON only.
                """;

        JsonNode result =
                gemini.generate(
                        instruction,
                        material
                );

        validateAllResources(result);

        return Map.of(
                "notes",
                result.get("notes"),

                "flashcards",
                result.get("flashcards"),

                "quiz",
                result.get("quiz"),

                "mindmap",
                result.get("mindmap")
        );
    }

    // =========================================================
    // SAVE ALL RESOURCES
    // =========================================================

    private void saveAllResources(
            Document d,
            JsonNode notes,
            JsonNode flashcards,
            JsonNode quiz,
            JsonNode mindmap
    ) {

        try {

            if (notes != null) {
                d.notesJson =
                        mapper.writeValueAsString(notes);
            }

            if (flashcards != null) {
                d.flashcardsJson =
                        mapper.writeValueAsString(flashcards);
            }

            if (quiz != null) {
                d.quizJson =
                        mapper.writeValueAsString(quiz);
            }

            if (mindmap != null) {
                d.mindMapJson =
                        mapper.writeValueAsString(mindmap);
            }

            repo.save(d);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to save generated resources."
            );
        }
    }

    // =========================================================
    // CHECK CACHE
    // =========================================================

    private boolean hasAllResources(Document d) {

        return d.notesJson != null
                && d.flashcardsJson != null
                && d.quizJson != null
                && d.mindMapJson != null;
    }

    // =========================================================
    // GET RESOURCE FROM RESULT
    // =========================================================

    private JsonNode getResourceFromResult(
            Map<String, JsonNode> result,
            String type
    ) {

        return switch (type.toLowerCase()) {

            case "notes" ->
                    result.get("notes");

            case "flashcards" ->
                    result.get("flashcards");

            case "quiz" ->
                    result.get("quiz");

            case "mindmap" ->
                    result.get("mindmap");

            default ->
                    throw new IllegalArgumentException(
                            "Unknown resource type."
                    );
        };
    }

    // =========================================================
    // VALIDATE GEMINI RESPONSE
    // =========================================================

    private void validateAllResources(
            JsonNode result
    ) {

        if (result == null || !result.isObject()) {

            throw new IllegalArgumentException(
                    "AI returned invalid content."
            );
        }

        JsonNode notes =
                result.get("notes");

        JsonNode flashcards =
                result.get("flashcards");

        JsonNode quiz =
                result.get("quiz");

        JsonNode mindmap =
                result.get("mindmap");

        if (notes == null
                || !notes.hasNonNull("overview")
                || !notes.path("keyPoints").isArray()) {

            throw new IllegalArgumentException(
                    "AI returned incomplete notes."
            );
        }

        if (flashcards == null
                || !flashcards.path("flashcards").isArray()) {

            throw new IllegalArgumentException(
                    "AI returned incomplete flashcards."
            );
        }

        if (quiz == null
                || !quiz.path("questions").isArray()) {

            throw new IllegalArgumentException(
                    "AI returned incomplete quiz."
            );
        }

        if (mindmap == null
                || !mindmap.hasNonNull("topic")
                || !mindmap.path("nodes").isArray()
                || !mindmap.path("edges").isArray()) {

            throw new IllegalArgumentException(
                    "AI returned incomplete mind map."
            );
        }
    }

    // =========================================================
    // GET SAVED RESOURCE
    // =========================================================

    public JsonNode resource(
            long id,
            String type,
            String email
    ) {

        Document d = get(id, email);

        String json = switch (type.toLowerCase()) {

            case "notes" ->
                    d.notesJson;

            case "flashcards" ->
                    d.flashcardsJson;

            case "quiz" ->
                    d.quizJson;

            case "mindmap" ->
                    d.mindMapJson;

            default ->
                    null;
        };

        if (json == null) {
            return null;
        }

        try {

            return mapper.readTree(json);

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Saved content is invalid."
            );
        }
    }

    // =========================================================
    // GET ONE USER'S DOCUMENT
    // =========================================================

    public Document get(
            long id,
            String email
    ) {

        User user = currentUser(email);

        return repo
                .findByIdAndUser(id, user)
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Document not found."
                        )
                );
    }

    // =========================================================
    // GET CURRENT USER'S DOCUMENTS
    // =========================================================

    public List<Document> all(
            String email
    ) {

        User user = currentUser(email);

        return repo.findAllByUserOrderByUploadedAtDesc(
                user
        );
    }

    // =========================================================
    // DELETE CURRENT USER'S DOCUMENT
    // =========================================================

    @Transactional
    public void delete(
            long id,
            String email
    ) {

        User user = currentUser(email);

        Document document =
                repo.findByIdAndUser(id, user)
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Document not found."
                                )
                        );

        repo.delete(document);
    }
}