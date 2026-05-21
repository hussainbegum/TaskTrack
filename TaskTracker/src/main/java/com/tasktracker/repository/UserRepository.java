package com.tasktracker.repository;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tasktracker.model.User;
import com.tasktracker.model.Role;
import java.util.List;


public interface UserRepository extends JpaRepository<User, Long> { 
	
	    Optional<User> findByEmail(String email);
    User findByName(String name);

    // Find users by role
    List<User> findByRole(Role role);

    // Pageable version to return a page of users by role
    Page<User> findByRole(Role role, Pageable pageable);
}
