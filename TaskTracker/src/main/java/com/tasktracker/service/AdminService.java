package com.tasktracker.service;

import java.util.List;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // User Management
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User createUser(User user){
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }
    
    public User updateUser(User user){
        User existingUser = userRepository.findById(user.getId()).orElse(null);
        if (existingUser != null) {
            if (user.getName() != null) existingUser.setName(user.getName());
            if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
            if (user.getRole() != null) existingUser.setRole(user.getRole());
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            return userRepository.save(existingUser);
        }
        return null;
    }

    public void deleteUser(Long id){
        userRepository.deleteById(id);
    }

    public List<Task> getUserTasks(Long userId){
        return taskRepository.findByUserId(userId);
    }

    // Task Management
    public List<Task> getAllTasks(){
        return taskRepository.findAll();
    }
    
    public Task getTaskById(Long id){
        return taskRepository.findById(id).orElse(null);
    }

    public Task createTask(Task task){
        task.setCreatedAt(new Date());
        task.setUpdatedAt(new Date());
        if (task.getStatus() == null) {
            task.setStatus("pending");
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Task task){
        Task existingTask = taskRepository.findById(task.getId()).orElse(null);
        if (existingTask != null) {
            if (task.getTitle() != null) existingTask.setTitle(task.getTitle());
            if (task.getDescription() != null) existingTask.setDescription(task.getDescription());
            if (task.getStatus() != null) existingTask.setStatus(task.getStatus());
            if (task.getUserId() != null) existingTask.setUserId(task.getUserId());
            if (task.getPriority() != null) existingTask.setPriority(task.getPriority());
            if (task.getDueDate() != null) existingTask.setDueDate(task.getDueDate());
            existingTask.setUpdatedAt(new Date());
            return taskRepository.save(existingTask);
        }
        return null;
    }

    public void deleteTask(Long id){
        taskRepository.deleteById(id);
    }
}