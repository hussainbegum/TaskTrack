package com.tasktracker.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.security.JwtUtil;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins="http://localhost:4200")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
    	
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        
        // Default role is USER if not specified
        if (user.getRole() == null) {
            user.setRole(com.tasktracker.model.Role.USER);
        }

        User savedUser = repo.save(user);
        
        // Remove password from response
        savedUser.setPassword(null);
        return ResponseEntity.ok(savedUser);
    }

    // Login - Return token and role
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User dbUser = repo.findByEmail(user.getEmail()).orElse(null);

        if (dbUser != null && passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {
            String token = jwtUtil.generateToken(user.getEmail(), dbUser.getRole().toString());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", dbUser.getRole().toString());
            response.put("username", dbUser.getName());
            response.put("email", dbUser.getEmail());
            
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid Credentials"));
    }
}