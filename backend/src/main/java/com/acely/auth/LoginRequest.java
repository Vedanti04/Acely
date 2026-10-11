package com.acely.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    public String email;

    @NotBlank(message = "Password is required.")
    public String password;
}