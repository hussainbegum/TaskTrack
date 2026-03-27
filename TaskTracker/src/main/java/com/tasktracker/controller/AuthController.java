package com.tasktracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.tasktracker.model.Role;
import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.security.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    @CrossOrigin(origins = {"http://localhost:4200"})
    public User signup(@RequestBody User user) {
        System.out.println("Received signup request for: " + user.getEmail());
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        User savedUser = repo.save(user);
        System.out.println("User saved successfully with ID: " + savedUser.getId());
        return savedUser;
    }

    @PostMapping("/login")
    @CrossOrigin(origins = {"http://localhost:4200"})
    public String login(@RequestBody User user) {
        System.out.println("Received login request for: " + user.getEmail());
        User dbUser = repo.findByEmail(user.getEmail()).orElse(null);

        if (dbUser != null && passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
            String token = jwtUtil.generateToken(user.getEmail());
            System.out.println("Login successful for: " + user.getEmail());
            return token;
        }
        System.out.println("Login failed for: " + user.getEmail());
        return "Invalid Credentials";
    }
}