package com.tasktracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;

@Service
public class UserService {
	
	@Autowired
	private UserRepository userRepository;
	
	public User getUserByEmail(String email) {
		return userRepository.findByEmail(email).orElse(null);
	}
}