package com.by.sasa.bistrovic.logistics.tracking;

import java.util.ArrayList;
import java.util.Collection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Order> fetchOrders() {
        return orderRepository.findAll();
    }

    public Order createOrder(Order orderData) {
        orderData.setCreatedAt(java.time.LocalDateTime.now());
        orderData.setStatus(OrderStatus.pending);

        double distanceKM = GeoUtils.calculateDistance(orderData.getPickupLocation().getLatitude(), orderData.getPickupLocation().getLongitude(), orderData.getDeliveryLocation().getLatitude(), orderData.getDeliveryLocation().getLongitude());
        
        orderData.setDistanceKm(distanceKM);

        StatusUpdate statusUpdate = new StatusUpdate();

        statusUpdate.setStatus("created");
        statusUpdate.setTimestamp(java.time.LocalDateTime.now().toString());
        statusUpdate.setNote("Order automatically created with price: " + orderData.getPrice() + " " + orderData.getCurrency());

        orderData.addStatusUpdate(statusUpdate);

        StatusUpdate statusUpdate2 = new StatusUpdate();

        statusUpdate2.setStatus("pending");
        statusUpdate2.setTimestamp(java.time.LocalDateTime.now().toString());
        statusUpdate2.setNote("Order created with status: pending");

        orderData.addStatusUpdate(statusUpdate2);
        
        return orderRepository.save(orderData);
    }

public Order updateOrderStatus(String orderId, StatusUpdateRequest request) {
    Optional<Order> orderOpt = orderRepository.findById(orderId);
    if (orderOpt.isPresent()) {
        Order order = orderOpt.get();
        
        //if (order.getTransporterId() == null || Objects.equals(order.getTransporterId(), request.getTransporterId())) {
            //order.setTransporterId(request.getTransporterId());
            //order.setTransporterVehicleId(request.getTransporterVehicleId());
            if (request.getCurrentLocation()!= null) {
            order.setCurrentLocation(request.getCurrentLocation());
            }
            order.setStatus(request.getStatus());

            StatusUpdate statusUpdate = new StatusUpdate();

            statusUpdate.setStatus(request.getStatusUpdate());
            statusUpdate.setTimestamp(request.getTimestamp());
            statusUpdate.setNote(request.getNote());

            order.addStatusUpdate(statusUpdate);

            return orderRepository.save(order);
        //}
    }
    return null; // Možda je bolje baciti izuzetak umesto vraćanja null
}


    public Order updateOrderLocation(String orderId, Location location) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setCurrentLocation(location);
            return orderRepository.save(order);
        }
        return null; // Handle not found
    }

    public List<Order> getOrdersByUser(String userId, String role) {
        if ("orderer".equals(role)) {
            return orderRepository.findByOrdererId(userId);
        } else if ("transporter".equals(role)) {
            return orderRepository.findByTransporterId(userId);
        }
        return List.of();
    }

    public List<Order> getAvailableOrders() {
        return orderRepository.findByStatus(OrderStatus.pending);
    }
    
    public void proposeOrderPrice(String orderId, ProposePriceRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setProposedPrice(request.getPrice());
        order.setTransporterId(request.getTransporterId());
        order.setTransporterVehicleId(request.getTransporterVehicleId());
        order.setCurrentLocation(request.getCurrentLocation());
        order.setCurrency(request.getCurrency());
        order.setStatus(OrderStatus.determine_price);
        
        StatusUpdate statusUpdate = new StatusUpdate();

        statusUpdate.setStatus("determine_price");
        statusUpdate.setTimestamp(java.time.LocalDateTime.now().toString());
        statusUpdate.setNote("Transporter proposed price: " + request.getPrice());

        order.addStatusUpdate(statusUpdate);

        orderRepository.save(order);
    }

    public void acceptProposedPrice(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getProposedPrice() == 0.0) {
            throw new RuntimeException("No proposed price to accept");
        }

        order.setStatus(OrderStatus.accepted);
        order.setPrice(order.getProposedPrice());
        
        StatusUpdate statusUpdate = new StatusUpdate();

        statusUpdate.setStatus("accepted");
        statusUpdate.setTimestamp(java.time.LocalDateTime.now().toString());
        statusUpdate.setNote("Orderer accepted price: " + order.getProposedPrice());

        order.addStatusUpdate(statusUpdate);

        orderRepository.save(order);
    }    
    
    List<Order> findOrderByTransporterVehicleId(String transporterVehicleId) {
        return orderRepository.findByTransporterVehicleIdAndStatusIn(transporterVehicleId, List.of(OrderStatus.pending, OrderStatus.determine_price, OrderStatus.accepted, OrderStatus.pickup, OrderStatus.in_transit));
    }
}
