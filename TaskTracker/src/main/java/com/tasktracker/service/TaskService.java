package com.tasktracker.service;

import java.util.Date;
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
		task.setCreatedAt(new Date());
		task.setUpdatedAt(new Date());
		if (task.getStatus() == null) {
			task.setStatus("pending");
		}
		return taskRepository.save(task);
	}

	public List<Task> getAllTasks() {
		return taskRepository.findAll();
	}
	
	public List<Task> getTasksByUserId(Long userId) {
		return taskRepository.findByUserId(userId);
	}
	
	public Task getTaskById(Long id) {
		return taskRepository.findById(id).orElse(null);
	}

	public void deleteTask(Long id) {
		taskRepository.deleteById(id);
	}

	public Task updateTask(Task task) {
		task.setUpdatedAt(new Date());
		return taskRepository.save(task);
	}
}