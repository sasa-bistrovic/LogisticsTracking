package com.by.sasa.bistrovic.logistics.tracking;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;
    

    public Vehicle addVehicle(String userId, Vehicle vehicle) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();
        //vehicle.setUser(user);
        return vehicleRepository.save(vehicle);
    }

    
    public List<Vehicle> getVehicles(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        return vehicleRepository.findByUser(userOpt.get());
    }
    
     public Vehicle getVehicle(String vehicleId) {
        Optional<Vehicle> vehicleById = vehicleRepository.findById(vehicleId);
        Vehicle vehicle = vehicleById.get();
        return vehicle;
    }
     
}