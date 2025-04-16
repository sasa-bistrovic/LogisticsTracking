package com.by.sasa.bistrovic.logistics.tracking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;    

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
        userData.setAddress("");
        userData.setAvatar("");
        return authService.register(userData);
    }
}
