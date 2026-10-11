package com.acely.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Name is required.")
    @Size(max = 120, message = "Name is too long.")
    public String name;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    @Size(max = 190, message = "Email is too long.")
    public String email;

    @NotBlank(message = "Password is required.")
    @Size(
        min = 6,
        max = 100,
        message = "Password must be between 6 and 100 characters."
    )
    public String password;
}