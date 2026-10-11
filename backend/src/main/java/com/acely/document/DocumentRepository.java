package com.acely.document;

import com.acely.user.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findAllByUserOrderByUploadedAtDesc(
            User user
    );

    Optional<Document> findByIdAndUser(
            Long id,
            User user
    );

    void deleteByIdAndUser(
            Long id,
            User user
    );
}