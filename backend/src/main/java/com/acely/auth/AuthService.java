package com.acely.auth;

import com.acely.security.JwtService;
import com.acely.user.User;
import com.acely.user.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(
            RegisterRequest request
    ) {

        String email =
                normalizeEmail(request.email);

        String name =
                request.name.trim();

        if (name.isBlank()) {
            throw new IllegalArgumentException(
                    "Name is required."
            );
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {

            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        User user = new User();

        user.name = name;
        user.email = email;

        // NEVER store the plain password.
        user.password =
                passwordEncoder.encode(
                        request.password
                );

        user.role = "USER";

        user = userRepository.save(user);

        String token =
                jwtService.generateToken(
                        user.id,
                        user.email,
                        user.role
                );

        return toResponse(user, token);
    }

    public AuthResponse login(
            LoginRequest request
    ) {

        String email =
                normalizeEmail(request.email);

        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Invalid email or password."
                                )
                        );

        if (!passwordEncoder.matches(
                request.password,
                user.password
        )) {

            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        String token =
                jwtService.generateToken(
                        user.id,
                        user.email,
                        user.role
                );

        return toResponse(user, token);
    }

    public AuthResponse me(
            String email
    ) {

        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "User account no longer exists."
                                )
                        );

        return toResponse(user, null);
    }

    private AuthResponse toResponse(
            User user,
            String token
    ) {

        return new AuthResponse(
                token,
                user.id,
                user.name,
                user.email,
                user.role
        );
    }

    private String normalizeEmail(
            String email
    ) {

        if (email == null) {
            return "";
        }

        return email.trim().toLowerCase();
    }
}
