package com.tasktracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tasktracker.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    
    void deleteByUserId(Long userId);
    
    
   // Page<Task> findByUserId(Long userId, Pageable pageable);
}