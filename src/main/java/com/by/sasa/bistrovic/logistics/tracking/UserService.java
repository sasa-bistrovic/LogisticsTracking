package com.by.sasa.bistrovic.logistics.tracking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }    
    
    public User addVehicleToUser(String userId, Vehicle vehicle) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        //user.getVehicles().add(vehicle);
        return userRepository.save(user);
    }
    
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }    
    
    public User updateUser(String userId, User newUserData) {
        return userRepository.findById(userId)
            .map(user -> {
                if (newUserData.getName() != null) user.setName(newUserData.getName());
                if (newUserData.getEmail() != null) user.setEmail(newUserData.getEmail());
                if (newUserData.getPhone() != null) user.setPhone(newUserData.getPhone());
                if (newUserData.getAddress() != null) user.setAddress(newUserData.getAddress());
                if (newUserData.getRole() != null) user.setRole(newUserData.getRole());
                return userRepository.save(user); // Save and return updated user
            })
            .orElseThrow(() -> new RuntimeException("User not found"));
    }    

    public User findUserByVehicleId(String vehicleId) {
        // Find user by vehicle ID
        return userRepository.findUserByVehicleId(vehicleId);
    }
    
    public User registerUser(User user) {
        user.setEnabled(false);
        user.setVerificationToken(UUID.randomUUID().toString());
        user.setTokenExpiryDate(LocalDateTime.now().plusHours(24));
        return userRepository.save(user);
    }

    public boolean verifyUser(String token) {
        Optional<User> user = userRepository.findByVerificationToken(token);
        if (user.isPresent() && user.get().getTokenExpiryDate().isAfter(LocalDateTime.now())) {
            User verifiedUser = user.get();
            verifiedUser.setEnabled(true);
            verifiedUser.setVerificationToken(null); // clear the token
            verifiedUser.setTokenExpiryDate(null);   // clear the token expiry date
            userRepository.save(verifiedUser);
            return true;
        }
        return false;
    }
    
    // Generate a new verification token
    public void generateNewVerificationToken(User user) {
        String newToken = UUID.randomUUID().toString();
        user.setTokenExpiryDate(LocalDateTime.now().plusHours(24));
        user.setVerificationToken(newToken);
        userRepository.save(user);
    }

    // Update user's password
    public void updatePassword(User user, String newPassword) {
        // Implement password encryption logic if needed
        user.setPassword(newPassword);
        user.setEnabled(true);
        user.setPasswordResetToken(null); // clear the token
        user.setTokenExpirationDate(null);   // clear the token expiry date
        userRepository.save(user);
    }

    public void deleteUser(User user) {
        userRepository.delete(user);
    }    

    public void generateNewPasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setTokenExpirationDate(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
    }

    public Optional<User> findByPasswordResetToken(String token) {
        return userRepository.findByPasswordResetToken(token);
    }    
    
    public User save(User user) {
        // Here, you can add additional business logic before saving the user
        return userRepository.save(user);
    }
    
    public List<User> saveAll(List<User> user) {
        // Here, you can add additional business logic before saving the user
        return userRepository.saveAll(user);
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
}
