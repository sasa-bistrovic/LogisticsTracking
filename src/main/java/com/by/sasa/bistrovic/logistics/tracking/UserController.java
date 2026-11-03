package com.by.sasa.bistrovic.logistics.tracking;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = {
    "https://logitrack.expense-tracking.com",
    "https://logitrack-3597a2bc3b29.herokuapp.com",
    "http://localhost:8080",
    "http://localhost:8081"
})
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
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

    @GetMapping("/all")
    public List<User> getUAllUsers(HttpServletRequest request) {
        validateToken(request);
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id, HttpServletRequest request) {
        validateToken(request);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/get-by-email/{email}")
    public ResponseEntity<Boolean> getUserByEmail(@PathVariable String email) {
        Boolean ifUserExists = false;
        User user = userRepository.findByEmail(email);
        if (user!=null) {
            ifUserExists = true;
        }
        return ResponseEntity.ok(ifUserExists);
    }

    @PostMapping("/{userId}/vehicles")
    public ResponseEntity<User> addVehicleToUser(@PathVariable String userId,
                                                 @RequestBody Vehicle vehicle,
                                                 HttpServletRequest request) {
        validateToken(request);
        Optional<User> user1 = userRepository.findById(userId);
        User user = user1.get();
        user.addVehicle(vehicle);
        userRepository.save(user);
        return ResponseEntity.ok(userRepository.findById(userId).get());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId,
                                           @RequestBody User userData,
                                           HttpServletRequest request) {
        validateToken(request);
        User updatedUser = userService.updateUser(userId, userData);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/by-vehicle/{vehicleId}")
    public ResponseEntity<User> getUserByVehicleId(@PathVariable String vehicleId, HttpServletRequest request) {
        validateToken(request);
        User user = userService.findUserByVehicleId(vehicleId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }    

    @GetMapping("/verify")
    public String verifyUser(@RequestParam("token") String token) {
        boolean isVerified = userService.verifyUser(token);
        return isVerified ? "Email verified successfully." : "Verification failed.";
    }

    @GetMapping("/resend-verification")
    public String resendVerification(@RequestParam("email") String email) {
        User userOptional = userService.findByEmail(email);
        
        if (userOptional==null) {
            return "User not found.";
        }

        try {
            userService.generateNewVerificationToken(userOptional);
            emailService.sendVerificationEmail(email, userOptional.getVerificationToken());
        } catch (UnsupportedEncodingException ex) {
            Logger.getLogger(UserController.class.getName()).log(Level.SEVERE, null, ex);
            return "Failed to resend verification email.";
        }

        return "Verification email sent.";
    }
    
    @GetMapping("/if-is-user-enabled/{email}")
    public Boolean ifIsUserEnabled(@PathVariable String email) {        
        User userOptional = userService.findByEmail(email);
        Boolean ifIsEnabled = false;
        
        if (userOptional==null) {
            return ifIsEnabled;
        }

        ifIsEnabled = userOptional.isEnabled();

        return ifIsEnabled;
    }    

    @GetMapping("/request-password-reset")
    public String requestPasswordReset(@RequestParam("email") String email) {
    User userOptional = userService.findByEmail(email);
    
    if (userOptional==null) {
        return "User not found.";
    }

    try {
        userService.generateNewPasswordResetToken(userOptional);
        emailService.sendPasswordResetEmail(email, userOptional.getPasswordResetToken());
    } catch (UnsupportedEncodingException ex) {
        Logger.getLogger(UserController.class.getName()).log(Level.SEVERE, null, ex);
        return "Failed to send password reset email.";
    }

    return "Password reset email sent.";
    }

    @PutMapping("/reset-password")
    public String resetPassword(@RequestBody Map<String, String> payload) {
        
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");
    
        Optional<User> userOptional = userService.findByPasswordResetToken(token);
        if (!userOptional.isPresent()) {
            return "Invalid or expired password reset token.";
        }

        User user = userOptional.get();
        userService.updatePassword(user, newPassword);
        return "Password has been reset successfully.";
    }
    
    
 /*   
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
*/
}
