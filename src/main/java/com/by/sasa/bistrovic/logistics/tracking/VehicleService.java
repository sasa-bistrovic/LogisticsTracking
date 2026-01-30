package com.by.sasa.bistrovic.logistics.tracking;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
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
    

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    } 
    
    public List<Vehicle> getAllTransporterVehicles() {
        return vehicleRepository.findByUserRole(UserRole.transporter);
    }
    
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

    public Vehicle updateVehicle(String vehicleId, Vehicle newVehicle) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);
        
        if (vehicleOpt.isPresent()) {
            
            Vehicle vehicle = vehicleOpt.get();

            if (newVehicle.getType() != null) vehicle.setType(newVehicle.getType());
            if (newVehicle.getModel() != null) vehicle.setModel(newVehicle.getModel());
            if (newVehicle.getLicensePlate() != null) vehicle.setLicensePlate(newVehicle.getLicensePlate());
            if (newVehicle.getMaxWeight() != 0.0) vehicle.setMaxWeight(newVehicle.getMaxWeight());
            if (newVehicle.getMaxVolume()!= 0.0) vehicle.setMaxVolume(newVehicle.getMaxVolume());
            vehicle.setAvailable(newVehicle.isAvailable());
            if (newVehicle.getCurrentLocation() != null) vehicle.setCurrentLocation(newVehicle.getCurrentLocation());
            if (newVehicle.getDimensions() != null) vehicle.setDimensions(newVehicle.getDimensions());
            vehicle.setIsRefrigerated(newVehicle.getIsRefrigerated());
            vehicle.setCoolingCoefficient(newVehicle.getCoolingCoefficient());
            vehicle.setHazardousCoefficient(newVehicle.getHazardousCoefficient());
            vehicle.setUrgentCoefficient(newVehicle.getUrgentCoefficient());
            vehicle.setBasePrice(newVehicle.getBasePrice());
            vehicle.setPricePerKg(newVehicle.getPricePerKg());
            vehicle.setPricePerKm(newVehicle.getPricePerKm());
            vehicle.setPricePerM3(newVehicle.getPricePerM3());
            vehicle.setPricePerApproachKm(newVehicle.getPricePerApproachKm());
            if (newVehicle.getCurrency() != null) vehicle.setCurrency(newVehicle.getCurrency());
            return vehicleRepository.save(vehicle); // Save and return updated user
        }                

        return null; // or however you associate it    
    }     
    
    public Vehicle updateVehicle2(String vehicleId, Vehicle updateVehicle) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);
        
        if (vehicleOpt.isPresent()) {
            
            Vehicle vehicle = vehicleOpt.get();

            if (updateVehicle.getCurrentLocation() != null) vehicle.setCurrentLocation(updateVehicle.getCurrentLocation());
            return vehicleRepository.save(vehicle); // Save and return updated user
        }                

        return null; // or however you associate it    
    }     
    
public void deleteVehicle(String vehicleId) {
    Vehicle vehicle = vehicleRepository.findById(vehicleId)
        .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));

    User user = vehicle.getUser();
    if (user != null) {
        user.getVehicles().remove(vehicle);
        vehicle.setUser(null);
        userRepository.save(user);
    }
    
    vehicle.setCurrentLocation(null);
    
    vehicleRepository.save(vehicle);

    vehicleRepository.delete(vehicle);
}
     
}