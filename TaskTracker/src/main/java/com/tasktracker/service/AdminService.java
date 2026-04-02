package com.tasktracker.service;

import java.util.List;

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
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User addUser(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String rawPassword = user.getPassword();

        user.setPassword(passwordEncoder.encode(rawPassword));

        User savedUser = userRepository.save(user);

        emailService.sendCredentialsMail(
                savedUser.getEmail(),
                savedUser.getEmail(),
                rawPassword
        );

        return savedUser;
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    public List<Task> getUserTasks(Long userId) {
        return taskRepository.findByUserId(userId);
    }
}