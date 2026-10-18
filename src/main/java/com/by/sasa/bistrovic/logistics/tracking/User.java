package com.by.sasa.bistrovic.logistics.tracking;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users2") // Avoids conflict with PostgreSQL reserved keyword "user"
public class User {

    @Id
    private String id;
    
    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();  // Generiše UUID ako nije već postavljen
        }
    }

    private String name;
    private String email;
    private String phone;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String avatar;
    private String address;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vehicle> vehicles = new ArrayList<>();

    @ElementCollection
    private List<String> providers;
    
    private boolean enabled;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "token_expiry_date")
    private LocalDateTime tokenExpiryDate;
    
    @Column(name = "password_reset_token")
    private String passwordResetToken;
    
    @Column(name = "token_expiration_date")
    private LocalDateTime tokenExpirationDate;

    // Constructors
    public User() {}

    public User(String name, String email, String phone, String password, UserRole role, String avatar, String address, boolean enabled, String verificationToken, LocalDateTime tokenExpiryDate, String passwordResetToken, LocalDateTime tokenExpirationDate) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.avatar = avatar;
        this.address = address;
        this.enabled = enabled;
        this.verificationToken = verificationToken;
        this.tokenExpirationDate = tokenExpiryDate;
        this.passwordResetToken = passwordResetToken;
        this.tokenExpiryDate = tokenExpirationDate;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public List<Vehicle> getVehicles() {
        return vehicles;
    }

    public void setVehicles(List<Vehicle> vehicles) {
        this.vehicles = vehicles;
    }

    public void addVehicle(Vehicle vehicle) {
        vehicles.add(vehicle);
        vehicle.setUser(this); // Postavlja referencu na ovog korisnika
    }

    public List<String> getProviders() { return providers; }
    public void setProviders(List<String> providers) { this.providers = providers; }
    
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public LocalDateTime getTokenExpiryDate() {
        return tokenExpiryDate;
    }

    public void setTokenExpiryDate(LocalDateTime tokenExpiryDate) {
        this.tokenExpiryDate = tokenExpiryDate;
    }
    
    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }
    
    public LocalDateTime getTokenExpirationDate() {
        return tokenExpirationDate;
    }

    public void setTokenExpirationDate(LocalDateTime tokenExpirationDate) {
        this.tokenExpirationDate = tokenExpirationDate;
    } 
}