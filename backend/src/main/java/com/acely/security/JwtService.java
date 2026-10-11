package com.acely.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs
    ) {

        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT secret must contain at least 32 characters."
            );
        }

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationMs = expirationMs;
    }

    public String generateToken(
            Long userId,
            String email,
            String role
    ) {

        Date now = new Date();

        Date expiration = new Date(
                now.getTime() + expirationMs
        );

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {

        return parseClaims(token)
                .getSubject();
    }

    public boolean isValid(String token) {

        try {

            Claims claims = parseClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    private Claims parseClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}