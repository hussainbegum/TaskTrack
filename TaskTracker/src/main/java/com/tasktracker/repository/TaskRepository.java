package com.tasktracker.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;


import com.tasktracker.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

}
	
