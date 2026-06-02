package com.tasktracker.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasktracker.model.User;
import com.tasktracker.security.JwtUtil;
import com.tasktracker.service.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    // Signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            User savedUser = authService.signup(user);
            return ResponseEntity.ok(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        Map<String, Object> loginResponse = authService.login(user.getEmail(), user.getPassword());

        if (loginResponse != null) {
            return ResponseEntity.ok(loginResponse);
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid Credentials"));
    }

    // Change Password
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Email and New Password are required");
        }

        try {
            authService.updatePassword(email, newPassword);
            return ResponseEntity.ok("Password changed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update Password
    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and New Password are required"));
        }

        try {
            authService.updatePassword(email, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update Profile
    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody Map<String, String> request) {
        String newName = request.get("name");
        String newEmail = request.get("email");

        if ((newName == null || newName.isBlank()) && (newEmail == null || newEmail.isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name or Email are required"));
        }

        String currentEmail = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                currentEmail = jwtUtil.extractUsername(token);
            }
        }

        if (currentEmail == null) {
            currentEmail = request.get("currentEmail");
            if (currentEmail == null) {
                currentEmail = request.get("email");
            }
        }

        if (currentEmail == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not determine user to update"));
        }

        try {
            Map<String, Object> updatedProfile = authService.updateProfile(currentEmail, newName, newEmail);
            return ResponseEntity.ok(updatedProfile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/updateuserprofile")
    public ResponseEntity<?> updateUserProfile(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                               @RequestBody Map<String, String> request) {
        try {
            User updatedUser = authService.updateUserProfile(authHeader, request);
            
            // Build the clean front-end expected success response maps
            Map<String, Object> resp = new HashMap<>();
            resp.put("name", updatedUser.getName());
            resp.put("email", updatedUser.getEmail());
            resp.put("role", updatedUser.getRole());
            resp.put("message", "Profile updated successfully");
            
            return ResponseEntity.ok(resp);
            
        } catch (IllegalArgumentException e) {
            // Gracefully catch validation rule failures and respond with bad requests
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Forgot Password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        try {
            authService.processForgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body("All fields are required");
        }

        try {
            authService.resetPassword(email, otp, newPassword);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}