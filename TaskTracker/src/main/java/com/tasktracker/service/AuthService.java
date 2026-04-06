package com.tasktracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder; // ✅ ADD THIS

    // ✅ Signup (encode password)
    public User signup(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword())); // 🔥 IMPORTANT
        return repo.save(user);
    }

    // ✅ Login (match encoded password)
    public User login(String email, String password){

        User user = repo.findByEmail(email).orElse(null);

        if(user != null && passwordEncoder.matches(password, user.getPassword())){
            return user;
        }

        throw new RuntimeException("Invalid Credentials"); // better than returning null
    }
}