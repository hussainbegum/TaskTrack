package com.tasktracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasktracker.model.Task;
import com.tasktracker.model.User;
import com.tasktracker.service.AdminService;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins="http://localhost:4200")
public class AdminController {
	 @Autowired
	    private AdminService adminService;

	    // get all users
	    @GetMapping("/users")
	    public List<User> getUsers(){
	        return adminService.getAllUsers();
	    }

	    // create user
	    @PostMapping("/add-user") 
	    public User createUser(@RequestBody User user){
	        return adminService.addUser(user);
	   
	    }
	    
	    
	    @GetMapping("/user/{userId}/tasks")
	    public List<Task> getTasksByUser(@PathVariable Long userId) {
	        return adminService.getTasksByUser(userId);
	    }

	    // delete user
	    @DeleteMapping("/users/{id}")
	    public String deleteUser(@PathVariable Long id){
	        adminService.deleteUser(id);
	        return "User Deleted";
	    }

	    // get tasks of specific user
	    @GetMapping("/users/{id}/tasks")
	    public List<Task> getUserTasks(@PathVariable Long id){
	        return adminService.getUserTasks(id);
	    }

	}


