package com.by.sasa.bistrovic.logistics.tracking;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByOrdererId(String ordererId);
    List<Order> findByTransporterId(String transporterId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByTransporterIdAndStatusIn(String transporterId, List<OrderStatus> statuses);
    List<Order> findByStatusInAndTransporterVehicleId(List<OrderStatus> statuses, String transporterVehicleId);    
}
