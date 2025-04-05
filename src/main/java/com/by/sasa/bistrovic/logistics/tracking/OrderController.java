package com.by.sasa.bistrovic.logistics.tracking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

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
}