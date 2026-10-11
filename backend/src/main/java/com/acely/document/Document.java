package com.acely.document;

import com.acely.user.User;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    public User user;

    @Column(nullable = false)
    public String fileName;

    @Column(nullable = false)
    public String fileType;

    public long fileSize;

    @Enumerated(EnumType.STRING)
    public Status status;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String extractedText;

    public Instant uploadedAt = Instant.now();

    @Lob
    @Column(columnDefinition = "TEXT")
    public String notesJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String flashcardsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String quizJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String mindMapJson;

    public enum Status {
        UPLOADED,
        PROCESSING,
        READY,
        FAILED
    }
}