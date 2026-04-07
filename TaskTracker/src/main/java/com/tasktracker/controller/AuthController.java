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
import com.tasktracker.service.EmailService;

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
    
    
    @Autowired
    private EmailService emailService;
    
    private Map<String, String> otpStorage = new HashMap<>();
    

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
    
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Email and New Password are required");
        }

        User user = repo.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);

        repo.save(user);

        // SEND EMAIL HERE
        emailService.sendPasswordChangeMail(
        	    user.getEmail(),
        	    user.getName() != null ? user.getName() : "User"
        	);

        return ResponseEntity.ok("Password changed successfully");
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        System.out.println("Received email: " + email);

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required"));
        }

        User user = repo.findByEmail(email).orElse(null);

        if (user == null) {
            System.out.println("User not found for email: " + email);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not found"));
        }

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        otpStorage.put(email, otp);

        emailService.sendOtpMail(email, otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ResponseEntity.badRequest().body("All fields are required");
        }

        String storedOtp = otpStorage.get(email);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        User user = repo.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        repo.save(user);

        // Remove OTP after successful use
        otpStorage.remove(email);

        emailService.sendPasswordChangeMail(
                user.getEmail(),
                user.getName() != null ? user.getName() : "User"
        );

   
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }
    
}