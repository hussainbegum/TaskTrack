package com.tasktracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tasktracker.model.Task;
import com.tasktracker.model.User;
import com.tasktracker.repository.TaskRepository;
import com.tasktracker.repository.UserRepository;

@Service
public class AdminService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    // Get all users
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    // Create user
    public User createUser(User user){
        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(Long id){
        userRepository.deleteById(id);
    }

    // Get tasks of specific user
    public List<Task> getUserTasks(Long userId){
        return taskRepository.findByUserId(userId);
    }

}


