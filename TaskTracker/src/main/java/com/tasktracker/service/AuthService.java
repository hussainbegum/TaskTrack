package com.tasktracker.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    // In-memory OTP storage
    private final Map<String, String> otpStorage = new HashMap<>();

    // Signup Logic
    public User signup(User user) {
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(com.tasktracker.model.Role.USER);
        }

        User savedUser = repo.save(user);
        savedUser.setPassword(null); // Clear password before returning
        return savedUser;
    }

    // Login Logic
    public Map<String, Object> login(String email, String rawPassword) {
        User dbUser = repo.findByEmail(email).orElse(null);

        if (dbUser != null && passwordEncoder.matches(rawPassword, dbUser.getPassword())) {
            String token = jwtUtil.generateToken(email, dbUser.getRole().toString());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", dbUser.getRole().toString());
            response.put("username", dbUser.getName());
            response.put("email", dbUser.getEmail());
            return response;
        }

        return null; 
    }

    public void updatePassword(String email, String newPassword) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstLogin(false);
        repo.save(user);

        emailService.sendPasswordChangeMail(
                user.getEmail(),
                user.getName() != null ? user.getName() : "User"
        );
    }

    public Map<String, Object> updateProfile(String currentEmail, String newName, String newEmail) {
        User user = repo.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (newEmail != null && !newEmail.equalsIgnoreCase(user.getEmail())) {
            if (repo.findByEmail(newEmail).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(newEmail);
        }

        if (newName != null && !newName.isBlank()) {
            user.setName(newName);
        }

        User updated = repo.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("name", updated.getName());
        resp.put("email", updated.getEmail());
        resp.put("message", "Profile updated successfully");
        return resp;
    }

    public void processForgotPassword(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        otpStorage.put(email, otp);

        emailService.sendOtpMail(email, otp);
    }
    
    public User updateUserProfile(String authHeader, Map<String, String> request) {
    	String newName = request.get("name");
        String newEmail = request.get("email");

        if ((newName == null || newName.isBlank()) && (newEmail == null || newEmail.isBlank())) {
            throw new IllegalArgumentException("Name or Email are required");
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
            throw new IllegalArgumentException("Could not determine user to update");
        }

        User user = repo.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (newEmail != null && !newEmail.equalsIgnoreCase(user.getEmail())) {
            if (repo.findByEmail(newEmail).isPresent()) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(newEmail);
        }
        if (newName != null && !newName.isBlank()) {
            user.setName(newName);
        }

        User updatedUser = repo.save(user);
        updatedUser.setPassword(null);
        
        return updatedUser;
    }

    // Reset Password Logic
    public void resetPassword(String email, String otp, String newPassword) {
        String storedOtp = otpStorage.get(email);

        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        repo.save(user);

        otpStorage.remove(email);

        emailService.sendPasswordChangeMail(
                user.getEmail(),
                user.getName() != null ? user.getName() : "User"
        );
    }
}