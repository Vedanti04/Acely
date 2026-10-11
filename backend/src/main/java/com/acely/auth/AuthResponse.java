package com.acely.auth;

public class AuthResponse {

    public String token;

    public Long userId;

    public String name;

    public String email;

    public String role;

    public AuthResponse(
            String token,
            Long userId,
            String name,
            String email,
            String role
    ) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}