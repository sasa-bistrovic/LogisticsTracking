package com.by.sasa.bistrovic.logistics.tracking;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User loginWithEmail(String email, String password) {
        User user = (User) userRepository.findByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null; // Invalid login credentials
    }

    public User loginWithPhone(String phone, String password) {
        User user = (User) userRepository.findByPhone(phone);
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null; // Invalid login credentials
    }

    public User register(User newUser) {
        return userRepository.save(newUser); // Save new user to the database
    }
}

