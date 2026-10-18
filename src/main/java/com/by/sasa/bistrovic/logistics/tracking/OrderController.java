package com.by.sasa.bistrovic.logistics.tracking;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = {
    "https://logitrack.expense-tracking.com",
    "https://logitrack-3597a2bc3b29.herokuapp.com",
    "http://localhost:8080",
    "http://localhost:8081"
})
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
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
    
    @GetMapping
    public List<Order> getOrders(HttpServletRequest request) {
        validateToken(request);
        return orderService.fetchOrders();
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order, HttpServletRequest request) {
        validateToken(request);
        return orderService.createOrder(order);
    }

    @PutMapping("/{orderId}/status")
    public Order updateOrderStatus(@PathVariable String orderId,
                                   @RequestBody StatusUpdateRequest statusUpdateRequest,
                                   HttpServletRequest request) {
        validateToken(request);
        return orderService.updateOrderStatus(orderId, statusUpdateRequest);
    }

    @PatchMapping("/{orderId}/location")
    public Order updateOrderLocation(@PathVariable String orderId,
                                     @RequestBody Location location,
                                     HttpServletRequest request) {
        validateToken(request);
        return orderService.updateOrderLocation(orderId, location);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable String userId,
                                       @RequestParam(required = false) String role,
                                       HttpServletRequest request) {
        validateToken(request);
        return orderService.getOrdersByUser(userId, role);
    }

    @GetMapping("/available")
    public List<Order> getAvailableOrders(HttpServletRequest request) {
        validateToken(request);
        return orderService.getAvailableOrders();
    }

    @PostMapping("/{orderId}/propose-price")
    public ResponseEntity<?> proposePrice(@PathVariable String orderId,
                                          @RequestBody ProposePriceRequest requestObj,
                                          HttpServletRequest request) {
        validateToken(request);
        orderService.proposeOrderPrice(orderId, requestObj);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/accept-price")
    public ResponseEntity<?> acceptPrice(@PathVariable String orderId, HttpServletRequest request) {
        validateToken(request);
        orderService.acceptProposedPrice(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/by-vehicleid-list-order/{vehicleId}")
    public List<Order> findOrdersByVehicleId(@PathVariable String vehicleId, HttpServletRequest request) {
        validateToken(request);
        return orderService.findOrderByTransporterVehicleId(vehicleId);
    }

/*    

    @GetMapping
    public List<Order> getOrders() {
        return orderService.fetchOrders();
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

@PutMapping("/{orderId}/status")
public Order updateOrderStatus(@PathVariable String orderId, 
                               @RequestBody StatusUpdateRequest statusUpdateRequest) {
    return orderService.updateOrderStatus(orderId, statusUpdateRequest);
}

    @PatchMapping("/{orderId}/location")
    public Order updateOrderLocation(@PathVariable String orderId, 
                                     @RequestBody Location location) {
        return orderService.updateOrderLocation(orderId, location);
    }

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable String userId, @RequestParam(required = false) String role) {
        return orderService.getOrdersByUser(userId, role);
    }

    @GetMapping("/available")
    public List<Order> getAvailableOrders() {
        return orderService.getAvailableOrders();
    }

    @PostMapping("/{orderId}/propose-price")
    public ResponseEntity<?> proposePrice(
            @PathVariable String orderId,
            @RequestBody ProposePriceRequest request
    ) {
        orderService.proposeOrderPrice(orderId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{orderId}/accept-price")
    public ResponseEntity<?> acceptPrice(@PathVariable String orderId) {
        orderService.acceptProposedPrice(orderId);
        return ResponseEntity.ok().build();
    }    
    
    @GetMapping("/by-vehicleid-list-order/{vehicleId}")
    public List<Order> findOrdersByVehicleId(@PathVariable String vehicleId) {
        return orderService.findOrderByTransporterVehicleId(vehicleId);
    }
*/    
}