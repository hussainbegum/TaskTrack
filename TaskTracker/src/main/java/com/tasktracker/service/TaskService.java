package com.tasktracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tasktracker.model.Task;
import com.tasktracker.repository.TaskRepository;

@Service
public class TaskService {
	  @Autowired
	    private TaskRepository taskRepository;

	    public Task createTask(Task task) {
	        return taskRepository.save(task);
	    }

	    public List<Task> getAllTasks() {
	        return taskRepository.findAll();
	    }

	    public void deleteTask(Long id) {
	        taskRepository.deleteById(id);
	    }

	    public Task updateTask(Task task) {
	        return taskRepository.save(task);
	    }
	

}
