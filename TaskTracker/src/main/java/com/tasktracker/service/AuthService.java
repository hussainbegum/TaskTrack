package com.tasktracker.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;

public class AuthService {
	   @Autowired
	    private UserRepository repo;

	    public User signup(User user){
	        return repo.save(user);
	    }

	    public User login(String email,String password){

	        User user = repo.findByEmail(email).orElse(null);

	        if(user!=null && user.getPassword().equals(password)){
	            return user;
	        }

	        return null;
	    }
}
