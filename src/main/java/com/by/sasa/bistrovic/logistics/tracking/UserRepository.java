package com.by.sasa.bistrovic.logistics.tracking;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, String> {
    User findByEmail(String email);
    User findByPhone(String phone);
    Optional<User> findByVerificationToken(String token);
    Optional<User> findByPasswordResetToken(String token);

    @Query("SELECT u FROM User u JOIN u.vehicles v WHERE v.id = :vehicleId")
    User findUserByVehicleId(String vehicleId);
}
