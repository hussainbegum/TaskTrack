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

    // Send credentials when user created
    public void sendUserCredentials(String toEmail, String name, String password) {
        try {
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
                    "Regards,\nTask Tracker Team",
                    name, toEmail, password
            ));

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Send task assignment email
    public void sendTaskAssignmentEmail(String toEmail, String userName, String taskTitle, String taskDescription, String dueDate) {
        try {

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("New Task Assigned: " + taskTitle);

            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "A new task has been assigned to you.\n\n" +
                    "Task Details:\n" +
                    "Title: %s\n" +
                    "Description: %s\n" +
                    "Due Date: %s\n\n" +
                    "Please log in to your dashboard to update the task status.\n\n" +
                    "Regards,\nTask Tracker Team",
                    userName,
                    taskTitle,
                    taskDescription != null ? taskDescription : "No description provided",
                    dueDate != null ? dueDate : "Not set"
            ));

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Send task completion email
    public void sendTaskCompletionEmail(String toEmail, String userName, String taskTitle) {
        try {

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Task Completed: " + taskTitle);

            message.setText(String.format(
                    "Dear %s,\n\n" +
                    "Great news! The following task has been marked as completed:\n\n" +
                    "Task: %s\n\n" +
                    "Keep up the good work!\n\n" +
                    "Regards,\nTask Tracker Team",
                    userName,
                    taskTitle
            ));

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Send OTP email (Forgot Password)
    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Task Tracker Password Reset OTP");

        message.setText(
                "Your OTP for password reset is: " + otp +
                "\n\nThis OTP is valid for one use only."
        );

        mailSender.send(message);
    }

    // Send password changed confirmation email
    public void sendPasswordChangedEmail(String toEmail) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Password Changed Successfully");

        message.setText(
                "Hello User,\n\n" +
                "Your password has been changed successfully.\n" +
                "You can now login using your new password.\n\n" +
                "Regards,\nTask Tracker Team"
        );

        mailSender.send(message);
    }

}