package com.tasktracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.tasktracker.model.User;
import com.tasktracker.repository.UserRepository;

public class UserService {
	 @Autowired
	    private UserRepository repo;

	    public List<User> getAllUsers(){
	        return repo.findAll();
	    }

	    public User addUser(User user){
	        return repo.save(user);
	    }

	    public void deleteUser(Long id){
	        repo.deleteById(id);
	    }
	}


