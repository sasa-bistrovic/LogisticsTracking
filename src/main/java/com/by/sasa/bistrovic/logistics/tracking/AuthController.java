package com.by.sasa.bistrovic.logistics.tracking;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = {
    "https://logitrack.expense-tracking.com",
    "https://logitrack-3597a2bc3b29.herokuapp.com",
    "http://localhost:8080",
    "http://localhost:8081"
})
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;    
    
    @Autowired
    private EmailService emailService;

    private final String secretKey = "superSecretKey123"; // prebaci u application.properties

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                //.setExpiration(new Date(System.currentTimeMillis() + 20000))
                .signWith(SignatureAlgorithm.HS512, secretKey)
                .compact();
    }

    public Claims decodeToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }    
    
@PostMapping("/login")
public Map<String, Object> login(@RequestBody LoginCredentials credentials) {
    Map<String, Object> response = new HashMap<>();

    User user = userRepository.findByEmail(credentials.getEmail());
    if (user != null) {
        if (user.getPassword()!=null) {
            if ("email".equals(credentials.getProvider())) {
                if (user.getPassword().equals(credentials.getPassword())) {
                    //User loggedUser = authService.loginWithEmail(credentials.getEmail(), credentials.getPassword());
                    System.out.println(user.getEmail());
                    String token = generateToken(user.getEmail());
                    response.put("user", user);
                    response.put("token", token);
                    return response;
                }
            }
        }
    }
    
    if (user != null) {
        if ("google".equals(credentials.getProvider())) {
            String token = generateToken(user.getEmail());
            response.put("user", user);
            response.put("token", token);
            return response;
        }
    }    
    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
}   

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User userData) {
            Map<String, Object> response = new HashMap<>();
            
            userData.setEnabled(false);
            userData.setVerificationToken(UUID.randomUUID().toString());
            userData.setTokenExpiryDate(LocalDateTime.now().plusHours(24));
            userData.setAvatar("");
            
        try {
            emailService.sendVerificationEmail(userData.getEmail(), userData.getVerificationToken());
        } catch (UnsupportedEncodingException ex) {
            return null;
        }
            authService.register(userData);
            String token = generateToken(userData.getEmail());
            response.put("user", userData);
            response.put("token", token);
            
            return response;
    }

/*    
    @PostMapping("/login")
    public User login(@RequestBody LoginCredentials credentials) {
        User user = userRepository.findByEmail(credentials.getEmail());
        if (user!=null) {
            if (user.getEmail().equals(credentials.getEmail()) && user.getPassword().equals(credentials.getPassword())) {
                if ("email".equals(credentials.getProvider())) {
                    return authService.loginWithEmail(credentials.getEmail(), credentials.getPassword());
                } else if ("phone".equals(credentials.getProvider())) {
                    return authService.loginWithPhone(credentials.getPhone(), credentials.getPassword());
                }
            }
        }
        return null; // Invalid provider
    }

    @PostMapping("/register")
    public User register(@RequestBody User userData) {
        //userData.setAddress("");
        userData.setAvatar("");
        return authService.register(userData);
    }
*/
}
