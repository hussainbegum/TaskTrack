package com.tasktracker.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public void sendUserCredentials(String toEmail, String name, String password) {
        try {
            System.out.println("Attempting to send email to: " + toEmail);
            System.out.println("From email: " + fromEmail);
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to Task Tracker - Your Account Created");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Your account has been created successfully.\n\n" +
                "Login Credentials:\n" +
                "Email: %s\n" +
                "Password: %s\n\n" +
                "Please change your password after login.\n\n" +
                "Regards,\n" +
                "Task Tracker Team",
                name, toEmail, password
            ));
            
            mailSender.send(message);
            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}