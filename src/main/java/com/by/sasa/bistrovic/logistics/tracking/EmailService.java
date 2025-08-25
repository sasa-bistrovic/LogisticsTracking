package com.by.sasa.bistrovic.logistics.tracking;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) throws UnsupportedEncodingException {
        String verificationUrl = "https://logitrack.expense-tracking.com/api/users/verify?token=" + token;

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            // Set the email properties
            helper.setTo(toEmail);
            helper.setSubject("Email Verification");
            helper.setText("Verification token: " + token + " Please click the following link to verify your email address: " + verificationUrl, true);

            // Set the "From" address and name
            helper.setFrom("sasa.bistrovic.email@gmail.com", "LogiTrack");

            // Send the email
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // Handle any errors that occur during email sending
            e.printStackTrace();
        }

    }

    public void sendPasswordResetEmail(String toEmail, String token) throws UnsupportedEncodingException {

        String resetToken = token;

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            // Set the email properties
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request");
            helper.setText("Please use token to reset your password: " + resetToken);
            helper.setFrom("sasa.bistrovic.email@gmail.com", "LogiTrack");

            // Send the email
            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // Handle any errors that occur during email sending
            e.printStackTrace();
        }
    }    
/*    
public void sendExceedingTheLimitEmail(String toEmail, String taskName, String value, String value2) throws UnsupportedEncodingException {

    try {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        // Set the email properties
        helper.setTo(toEmail);
        helper.setSubject("Exceeding The Limit");
        helper.setText("Your task \""+taskName+"\" has reached a balance of "+value+" out of the required limit "+value2);
        helper.setFrom("sasa.bistrovic.email@gmail.com", "Expense Tracking");

        // Send the email
        mailSender.send(mimeMessage);
    } catch (MessagingException e) {
        // Handle any errors that occur during email sending
        e.printStackTrace();
    }
} 
*/
}
