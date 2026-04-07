package com.tasktracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tasktracker.model.Task;
import com.tasktracker.model.User;
import com.tasktracker.service.TaskService;
import com.tasktracker.service.UserService;

@RestController
@RequestMapping("/user/tasks")
@CrossOrigin(origins="http://localhost:4200")
public class TaskController {
	
	@Autowired
	private TaskService taskService;
	
	@Autowired
	private UserService userService;

	// Get current user's tasks
	@GetMapping("/my-tasks")
	public List<Task> getMyTasks() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String email = auth.getName();
		User user = userService.getUserByEmail(email);
		return taskService.getTasksByUserId(user.getId());
	}

	@PostMapping("/create")
	public Task createTask(@RequestBody Task task) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String email = auth.getName();
		User user = userService.getUserByEmail(email);
		task.setUserId(user.getId());
		return taskService.createTask(task);
	}

	@PutMapping("/update/{id}")
	public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
		task.setId(id);
		return taskService.updateTask(task);
	}
	
	
	
	
	@PatchMapping("/{id}/status")
	public Task updateTaskStatus(@PathVariable Long id, @RequestBody Task task) {
		Task existingTask = taskService.getTaskById(id);
		existingTask.setStatus(task.getStatus());
		return taskService.updateTask(existingTask);
	}
	
	@DeleteMapping("/delete/{id}")
	public String deleteTask(@PathVariable Long id) {
		taskService.deleteTask(id);
		return "Task Deleted";
	}
}