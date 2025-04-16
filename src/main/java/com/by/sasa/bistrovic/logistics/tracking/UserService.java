package com.by.sasa.bistrovic.logistics.tracking;

import java.util.List;
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
}
