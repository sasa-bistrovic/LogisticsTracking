package com.by.sasa.bistrovic.logistics.tracking;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
@RequestMapping("/logistics")
public class LogisticsController {

    @Autowired
    private LogisticsService logisticsService;
    
    @Autowired
    private UserRepository userRepository;
    
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

    @GetMapping("/eligible-orders/{userId}")
    public List<Order> getEligibleOrders(@PathVariable String userId, HttpServletRequest request) {
        validateToken(request);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return logisticsService.getEligibleOrders(user);
    }

    @GetMapping("/eligible-vehicle/{userId}")
    public Vehicle findEligibleVehicle(@PathVariable String userId,
                                       @RequestParam(required = false) String orderId,
                                       HttpServletRequest request) {
        validateToken(request);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return logisticsService.findEligibleUserVehicle(user, orderId);
    }

    @GetMapping("/user-vehicle/{userId}")
    public Vehicle findUserVehicle(@PathVariable String userId,
                                   @RequestParam(required = false) String orderId,
                                   @RequestParam(required = false) String vehicleId,
                                   HttpServletRequest request) {
        validateToken(request);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return logisticsService.findUserVehicle(user, orderId, vehicleId);
    }
/*    
    @GetMapping("/eligible-orders/{userId}")
    public List<Order> getEligibleOrders(@PathVariable String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return logisticsService.getEligibleOrders(user);
    }

    @GetMapping("/eligible-vehicle/{userId}")
    public Vehicle findEligibleVehicle(@PathVariable String userId, @RequestParam(required = false) String orderId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return logisticsService.findEligibleUserVehicle(user, orderId);
    }    
    
    @GetMapping("/user-vehicle/{userId}")
    public Vehicle findUserVehicle(@PathVariable String userId, @RequestParam(required = false) String orderId, @RequestParam(required = false) String vehicleId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return logisticsService.findUserVehicle(user, orderId, vehicleId);
    }        
*/    
}
