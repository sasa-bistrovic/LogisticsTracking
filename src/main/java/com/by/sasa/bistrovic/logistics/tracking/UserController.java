package com.by.sasa.bistrovic.logistics.tracking;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    //@Autowired
    //private VehicleRepository vehicleRepository;
    
    @GetMapping("/all")
    public List<User> getUAllUsers() {
        List<User> users = userService.getAllUsers();
        return users;
    }    
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/get-by-email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/vehicles")
    public ResponseEntity<User> addVehicleToUser(@PathVariable String userId, @RequestBody Vehicle vehicle) {
        //vehicle.setLicensePlate("XYZ-123");
        Optional<User> user1 = userRepository.findById(userId);
        User user = user1.get();
        //vehicle.setUser(user); // Ensure user is set
        //vehicleRepository.save(vehicle);
        //User updatedUser = userService.addVehicleToUser(userId, vehicle);
        
        //vehicleRepository.save(vehicle);
        
        user1 = userRepository.findById(userId);
        user = user1.get();
        
        user.addVehicle(vehicle);
        
        userRepository.save(user);
        
        user1 = userRepository.findById(userId);
        user = user1.get();
        
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId, @RequestBody User userData) {
        User updatedUser = userService.updateUser(userId, userData);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/by-vehicle/{vehicleId}")
    public ResponseEntity<User> getUserByVehicleId(@PathVariable String vehicleId) {
        User user = userService.findUserByVehicleId(vehicleId);
        
        if (user == null) {
            return ResponseEntity.notFound().build();  // If user not found
        }
        
        return ResponseEntity.ok(user);  // Return the user found
    }    
}
