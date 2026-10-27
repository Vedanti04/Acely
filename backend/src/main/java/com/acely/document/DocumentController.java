package com.acely.document;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService service;

    public DocumentController(
            DocumentService service
    ) {
        this.service = service;
    }

    // =========================================================
    // UPLOAD
    // =========================================================

    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws Exception {

        Document document =
                service.upload(
                        file,
                        authentication.getName()
                );

        return summary(document);
    }

    // =========================================================
    // GET CURRENT USER'S DOCUMENTS
    // =========================================================

    @GetMapping
    public List<Map<String, Object>> list(
            Authentication authentication
    ) {

        return service
                .all(authentication.getName())
                .stream()
                .map(this::summary)
                .toList();
    }

    // =========================================================
    // GET ONE CURRENT USER DOCUMENT
    // =========================================================

    @GetMapping("/{id}")
    public Map<String, Object> get(
            @PathVariable long id,
            Authentication authentication
    ) {

        return summary(
                service.get(
                        id,
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable long id,
            Authentication authentication
    ) {

        service.delete(
                id,
                authentication.getName()
        );
    }

    // =========================================================
    // GENERATE ALL
    // =========================================================

    @PostMapping("/{id}/generate")
    public Map<String, Object> generateAll(
            @PathVariable long id,
            Authentication authentication
    ) {

        service.generateAll(
                id,
                authentication.getName()
        );

        return summary(
                service.get(
                        id,
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // REGENERATE ALL
    // =========================================================

    @PostMapping("/{id}/regenerate")
    public Map<String, Object> regenerateAll(
            @PathVariable long id,
            Authentication authentication
    ) {

        service.regenerateAll(
                id,
                authentication.getName()
        );

        return summary(
                service.get(
                        id,
                        authentication.getName()
                )
        );
    }

    // =========================================================
    // GENERATE ONE RESOURCE
    // =========================================================

    @PostMapping("/{id}/generate/{type}")
    public JsonNode generate(
            @PathVariable long id,
            @PathVariable String type,
            Authentication authentication
    ) {

        return service.generate(
                id,
                type,
                authentication.getName()
        );
    }

    // =========================================================
    // GET SAVED RESOURCE
    // =========================================================

    @GetMapping(
        "/{id}/{type:notes|flashcards|quiz|mindmap}"
    )
    public ResponseEntity<JsonNode> resource(
            @PathVariable long id,
            @PathVariable String type,
            Authentication authentication
    ) {

        JsonNode node =
                service.resource(
                        id,
                        type,
                        authentication.getName()
                );

        if (node == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(node);
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    private Map<String, Object> summary(
            Document document
    ) {

        return Map.of(
                "documentId",
                document.id,

                "fileName",
                document.fileName,

                "fileType",
                document.fileType,

                "fileSize",
                document.fileSize,

                "status",
                document.status,

                "uploadedAt",
                document.uploadedAt,

                "notesAvailable",
                document.notesJson != null,

                "flashcardsAvailable",
                document.flashcardsJson != null,

                "quizAvailable",
                document.quizJson != null,

                "mindMapAvailable",
                document.mindMapJson != null
        );
    }
}