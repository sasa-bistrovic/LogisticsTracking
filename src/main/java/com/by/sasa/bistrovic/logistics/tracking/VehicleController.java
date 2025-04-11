package com.by.sasa.bistrovic.logistics.tracking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;
    

    @PostMapping("/add/{userId}")
    public ResponseEntity<Vehicle> addVehicle(@PathVariable String userId, @RequestBody Vehicle vehicle) {
        Vehicle addedVehicle = vehicleService.addVehicle(userId, vehicle);
        return new ResponseEntity<>(addedVehicle, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Vehicle>> getVehicles() {
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        return new ResponseEntity<>(vehicles, HttpStatus.OK);
    }    
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Vehicle>> getVehicles(@PathVariable String userId) {
        List<Vehicle> vehicles = vehicleService.getVehicles(userId);
        return new ResponseEntity<>(vehicles, HttpStatus.OK);
    }
    
@GetMapping("/{vehicleId}")
public ResponseEntity<Vehicle> getVehicle(@PathVariable String vehicleId) {
    Vehicle vehicle = vehicleService.getVehicle(vehicleId);
    if (vehicle == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(vehicle);
}
    
    @PutMapping("/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable String vehicleId, @RequestBody Vehicle vehicle) {
        Vehicle updatedUser = vehicleService.updateVehicle(vehicleId, vehicle);
        return ResponseEntity.ok(updatedUser);
    }    
    
}
