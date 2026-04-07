package com.tasktracker.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    
    @Autowired
    private EmailService emailService;

    // User Management
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }
    
    public Page getUsers(Pageable pageable) {
    	return userRepository.findAll( pageable);
    }

    public User createUser(User user) {
        User nuser = new User();
        nuser.setName(user.getName());
        nuser.setEmail(user.getEmail());
        nuser.setRole(user.getRole());
        
        // Encode the password
        String rawPassword = user.getPassword();
        nuser.setPassword(passwordEncoder.encode(rawPassword));
        
        User savedUser = userRepository.save(nuser);
        
        // Send email with credentials
        emailService.sendUserCredentials(
            savedUser.getEmail(),
            savedUser.getName(),
            rawPassword
        );
        
        return savedUser;
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

    //public void deleteUser(Long id){
       // userRepository.deleteById(id);
   // }
    
   // public void deleteUser(Long id) {
        // Delete all tasks assigned to this user
     //   List<Task> userTasks = taskRepository.findByUserId(id);

        //if (userTasks != null && !userTasks.isEmpty()) {
            //taskRepository.deleteAll(userTasks);
       // }

        // Delete user after deleting tasks
        //userRepository.deleteById(id);
    //}
    
    public void deleteUser(Long oldUserId, String newUserName) {

        User newUser = userRepository.findByName(newUserName);

        if (newUser == null) {
            throw new RuntimeException("New user not found for task reassignment");
        }

        if (oldUserId.equals(newUser.getId())) {
            throw new RuntimeException("Cannot reassign tasks to same user");
        }

        List<Task> userTasks = taskRepository.findByUserId(oldUserId);

        for (Task task : userTasks) {
            task.setUserId(newUser.getId());
            task.setUpdatedAt(new Date());
        }

        taskRepository.saveAll(userTasks);

        userRepository.deleteById(oldUserId);
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
        
        Task savedTask = taskRepository.save(task);
        
        // Send email to the assigned user
        if (savedTask.getUserId() != null) {
            try {
                User assignedUser = userRepository.findById(savedTask.getUserId()).orElse(null);
                if (assignedUser != null && assignedUser.getEmail() != null) {
                    String dueDateStr = savedTask.getDueDate() != null ? savedTask.getDueDate().toString() : null;
                    emailService.sendTaskAssignmentEmail(
                        assignedUser.getEmail(),
                        assignedUser.getName(),
                        savedTask.getTitle(),
                        savedTask.getDescription(),
                        dueDateStr
                    );
                    System.out.println("Task assignment email sent to: " + assignedUser.getEmail());
                }
            } catch (Exception e) {
                System.err.println("Failed to send task assignment email: " + e.getMessage());
            }
        }
        
        return savedTask;
    }

    public Task updateTask(Task task){
        Task existingTask = taskRepository.findById(task.getId()).orElse(null);
        if (existingTask != null) {
            Long previousUserId = existingTask.getUserId();
            boolean isUserChanged = false;
            
            if (task.getTitle() != null) existingTask.setTitle(task.getTitle());
            if (task.getDescription() != null) existingTask.setDescription(task.getDescription());
            if (task.getStatus() != null) existingTask.setStatus(task.getStatus());
            
            // Check if user is being reassigned
            if (task.getUserId() != null) {
                if (previousUserId == null || !previousUserId.equals(task.getUserId())) {
                    isUserChanged = true;
                }
                existingTask.setUserId(task.getUserId());
            }
            
            if (task.getPriority() != null) existingTask.setPriority(task.getPriority());
            if (task.getDueDate() != null) existingTask.setDueDate(task.getDueDate());
            existingTask.setUpdatedAt(new Date());
            
            Task updatedTask = taskRepository.save(existingTask);
            
            // Send email if task is reassigned to a different user
            if (isUserChanged && updatedTask.getUserId() != null) {
                try {
                    User assignedUser = userRepository.findById(updatedTask.getUserId()).orElse(null);
                    if (assignedUser != null && assignedUser.getEmail() != null) {
                        String dueDateStr = updatedTask.getDueDate() != null ? updatedTask.getDueDate().toString() : null;
                        emailService.sendTaskAssignmentEmail(
                            assignedUser.getEmail(),
                            assignedUser.getName(),
                            updatedTask.getTitle(),
                            updatedTask.getDescription(),
                            dueDateStr
                        );
                        System.out.println("Task reassignment email sent to: " + assignedUser.getEmail());
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send task reassignment email: " + e.getMessage());
                }
            }
            
            // Send email if task status changed to completed
            if (task.getStatus() != null && "completed".equals(task.getStatus()) && !"completed".equals(existingTask.getStatus())) {
                try {
                    User assignedUser = userRepository.findById(updatedTask.getUserId()).orElse(null);
                    if (assignedUser != null && assignedUser.getEmail() != null) {
                        emailService.sendTaskCompletionEmail(
                            assignedUser.getEmail(),
                            assignedUser.getName(),
                            updatedTask.getTitle()
                        );
                        System.out.println("Task completion email sent to: " + assignedUser.getEmail());
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send task completion email: " + e.getMessage());
                }
            }
            
            return updatedTask;
        }
        return null;
    }

    public void deleteTask(Long id){
        taskRepository.deleteById(id);
    }
    
    // Add this method for updating just the task status
    public Task updateTaskStatus(Long taskId, String status) {
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            String previousStatus = task.getStatus();
            task.setStatus(status);
            task.setUpdatedAt(new Date());
            Task updatedTask = taskRepository.save(task);
            
            // Send email if task is marked as completed
            if (!"completed".equals(previousStatus) && "completed".equals(status)) {
                try {
                    User assignedUser = userRepository.findById(task.getUserId()).orElse(null);
                    if (assignedUser != null && assignedUser.getEmail() != null) {
                        emailService.sendTaskCompletionEmail(
                            assignedUser.getEmail(),
                            assignedUser.getName(),
                            task.getTitle()
                        );
                        System.out.println("Task completion email sent to: " + assignedUser.getEmail());
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send task completion email: " + e.getMessage());
                }
            }
            
            return updatedTask;
        }
        return null;
    }
}