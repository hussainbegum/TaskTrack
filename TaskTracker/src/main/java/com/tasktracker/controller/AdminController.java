package com.tasktracker.controller;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasktracker.model.Task;
import com.tasktracker.model.User;
import com.tasktracker.service.AdminService;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {
    @Autowired
    private AdminService adminService;

    // User Management
    @GetMapping("/users")
    public List<User> getUsers() {
        return adminService.getAllUsers();
    }

    @GetMapping("/userspage")
    public Page<User> getUserspage(Pageable pageable) {
        return adminService.getUsers(pageable);
    }

    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        System.out.println("Creating user: " + user.getEmail());
        return adminService.createUser(user);
    }

    @PutMapping("/users/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        return adminService.updateUser(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> requestBody) {
        
        System.out.println("=== DELETE REQUEST RECEIVED ===");
        System.out.println("User ID: " + id);
        System.out.println("Request Body: " + requestBody);
        
        // Get newUserName from request body
        String newUserName = requestBody != null ? requestBody.get("newUserName") : null;
        System.out.println("New User Name: " + newUserName);
        
        // Check if user has tasks
        List<Task> userTasks = adminService.getUserTasks(id);
        System.out.println("User has tasks: " + (userTasks != null ? userTasks.size() : 0));
        
        if (userTasks != null && !userTasks.isEmpty()) {
            // Case 1: User has tasks - require newUserName
            if (newUserName == null || newUserName.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body("User has " + userTasks.size() + " tasks. Please specify 'newUserName' to reassign tasks.");
            }
            adminService.deleteUserWithReassignment(id, newUserName);
            return ResponseEntity.ok("User deleted and " + userTasks.size() + " tasks reassigned to " + newUserName);
        } else {
            // Case 2: User has no tasks - just delete
            adminService.deleteUserWithoutTasks(id);
            return ResponseEntity.ok("User deleted successfully");
        }
    }

    @GetMapping("/users/{id}/tasks")
    public List<Task> getUserTasks(@PathVariable Long id) {
        return adminService.getUserTasks(id);
    }

    // Task Management
    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return adminService.getAllTasks();
    }

    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task) {
        System.out.println("Creating task: " + task.getTitle() + " for userId: " + task.getUserId());
        return adminService.createTask(task);
    }

    @PutMapping("/tasks/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        System.out.println("Updating task ID: " + id);
        System.out.println("Received update data: " + task);
        task.setId(id);
        return adminService.updateTask(task);
    }

    @PatchMapping("/tasks/{id}/status")
    public Task updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        System.out.println("Updating task status for ID: " + id);
        String newStatus = statusUpdate.get("status");
        System.out.println("New status: " + newStatus);

        Task task = adminService.getTaskById(id);
        if (task != null) {
            task.setStatus(newStatus);
            task.setUpdatedAt(new Date());
            return adminService.updateTask(task);
        }
        return null;
    }

    @DeleteMapping("/tasks/{id}")
    public String deleteTask(@PathVariable Long id) {
        adminService.deleteTask(id);
        return "Task Deleted";
    }
}