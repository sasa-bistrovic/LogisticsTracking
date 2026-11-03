package com.by.sasa.bistrovic.logistics.tracking;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findByUser(User user);
    List<Vehicle> findByUserId(String userId);
    List<Vehicle> findByUserRole(UserRole role);
}
