package com.by.sasa.bistrovic.logistics.tracking;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/logistics")
public class LogisticsController {

    @Autowired
    private LogisticsService logisticsService;
    
    @Autowired
    private UserRepository userRepository;
    
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
    
}
