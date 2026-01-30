package com.by.sasa.bistrovic.logistics.tracking;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = {
    "https://logitrack.expense-tracking.com",
    "https://logitrack-3597a2bc3b29.herokuapp.com",
    "http://localhost:8080",
    "http://localhost:8081"
})
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    private final String secretKey = "superSecretKey123"; // Prebaci u application.properties

    private void validateToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        String token = header.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(token)
                    .getBody();
            // Ako želiš, ovdje možeš provjeriti email/role iz claims
        } catch (SignatureException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token error: " + e.getMessage());
        }
    }    
    
    @PostMapping("/add/{userId}")
    public ResponseEntity<Vehicle> addVehicle(@PathVariable String userId,
                                              @RequestBody Vehicle vehicle,
                                              HttpServletRequest request) {
        validateToken(request);
        Vehicle addedVehicle = vehicleService.addVehicle(userId, vehicle);
        return new ResponseEntity<>(addedVehicle, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public List<Vehicle> getAllTransporterVehicles(HttpServletRequest request) {
        validateToken(request);
        return vehicleService.getAllTransporterVehicles();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Vehicle>> getVehicles(@PathVariable String userId, HttpServletRequest request) {
        validateToken(request);
        List<Vehicle> vehicles = vehicleService.getVehicles(userId);
        return new ResponseEntity<>(vehicles, HttpStatus.OK);
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable String vehicleId, HttpServletRequest request) {
        validateToken(request);
        Vehicle vehicle = vehicleService.getVehicle(vehicleId);
        if (vehicle == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(vehicle);
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable String vehicleId,
                                                 @RequestBody Vehicle vehicle,
                                                 HttpServletRequest request) {
        validateToken(request);
        Vehicle updatedUser = vehicleService.updateVehicle(vehicleId, vehicle);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/update/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle2(@PathVariable String vehicleId,
                                                  @RequestBody Vehicle updateVehicle,
                                                  HttpServletRequest request) {
        validateToken(request);
        Vehicle updatedUser = vehicleService.updateVehicle2(vehicleId, updateVehicle);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable String id, HttpServletRequest request) {
        validateToken(request);
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }    

/*    
    @PostMapping("/add/{userId}")
    public ResponseEntity<Vehicle> addVehicle(@PathVariable String userId, @RequestBody Vehicle vehicle) {
        Vehicle addedVehicle = vehicleService.addVehicle(userId, vehicle);
        return new ResponseEntity<>(addedVehicle, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public List<Vehicle> getAllTransporterVehicles() {
        return vehicleService.getAllTransporterVehicles();
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
    
    @PutMapping("/update/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle2(@PathVariable String vehicleId, @RequestBody Vehicle updateVehicle) {
        Vehicle updatedUser = vehicleService.updateVehicle2(vehicleId, updateVehicle);
        return ResponseEntity.ok(updatedUser);
    }    
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable String id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
*/    
}
