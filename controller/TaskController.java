package com.tasktracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tasktracker.model.Task;
import com.tasktracker.service.TaskService;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = {"http://localhost:4200"}, allowCredentials = "true")
public class TaskController {
	
	
	 @Autowired
	    private TaskService taskService;

	    @PostMapping("/create")
	    public Task createTask(@RequestBody Task task) {
	        return taskService.createTask(task);
	    }

	    @GetMapping("/all")
	    public List<Task> getAllTasks() {
	        return taskService.getAllTasks();
	    }

	    @PutMapping("/update/{id}")
	    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {

	        task.setId(id);

	        return taskService.updateTask(task);
	    }
	    @DeleteMapping("/delete/{id}")
	    public String deleteTask(@PathVariable Long id) {
	        taskService.deleteTask(id);
	        return "Task Deleted";
	    }
	
	
	

}
