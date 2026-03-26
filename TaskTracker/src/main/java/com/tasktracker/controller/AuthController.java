package com.tasktracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;
import com.tasktracker.security.JwtUtil;

@RestController
@RequestMapping("/auth")
public class AuthController {

	  @Autowired
	    private UserRepository repo;

	    @Autowired
	    private PasswordEncoder passwordEncoder;

	    @Autowired
	    private JwtUtil jwtUtil;

	    // Signup
	    @PostMapping("/signup")
	    public User signup(@RequestBody User user) {

	        String encodedPassword = passwordEncoder.encode(user.getPassword());
	        user.setPassword(encodedPassword);

	        return repo.save(user);
	    }

	    // Login
	    @PostMapping("/login")
	    public String login(@RequestBody User user) {

	        User dbUser = repo.findByEmail(user.getEmail()).orElse(null);

	        if (dbUser != null && passwordEncoder.matches(user.getPassword(), dbUser.getPassword())) {

	            String token = jwtUtil.generateToken(user.getEmail());

	            return token;
	        }

	        return "Invalid Credentials";
	    }
	}
	

    


