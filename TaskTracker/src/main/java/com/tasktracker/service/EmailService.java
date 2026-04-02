package com.tasktracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	
	
	@Autowired
    private JavaMailSender mailSender;

    public void sendCredentialsMail(String toEmail, String username, String password) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Task Tracker Login Credentials");
        message.setText(
                "Welcome to Task Tracker\n\n" +
                "Username: " + username + "\n" +
                "Password: " + password
        );

        mailSender.send(message);
        
        System.out.println("E-mail sent successfully to: " + toEmail);
    }
}


