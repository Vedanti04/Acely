package com.acely.user;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_users_email",
            columnNames = "email"
        )
    }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false, length = 120)
    public String name;

    @Column(nullable = false, unique = true, length = 190)
    public String email;

    @Column(nullable = false)
    public String password;

    @Column(nullable = false, length = 30)
    public String role = "USER";

    @Column(nullable = false)
    public Instant createdAt = Instant.now();

    public User() {
    }
}