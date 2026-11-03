package com.by.sasa.bistrovic.logistics.tracking;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.servlet.http.HttpSession;

import java.util.Map;

@RestController
@CrossOrigin(origins = {
    "https://logitrack.expense-tracking.com",
    "https://logitrack-3597a2bc3b29.herokuapp.com",
    "http://localhost:8080",
    "http://localhost:8081"
})
@RequestMapping("/auth")
public class GoogleAuthController {

    private static final String ALLOWED_EMAIL = "sasa.bistrovic@gmail.com";

    public static String myRedirectUri = "";

    public static class TokenExchangeRequest {
        private String code;

        @JsonProperty("redirectUri")
        private String redirectUri;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        @JsonProperty("redirectUri")
        public String getRedirectUri() {
            return redirectUri;
        }

        @JsonProperty("redirectUri")
        public void setRedirectUri(String redirectUri) {
            this.redirectUri = redirectUri;
        }
    }

    @PostMapping("/callback")
    public ResponseEntity<?> callbackPost(
            @RequestBody TokenExchangeRequest requestBody) {

        if (requestBody.getCode() == null ||
                requestBody.getCode().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Authorization code is missing.");
        }

        if (requestBody.getRedirectUri() == null ||
                requestBody.getRedirectUri().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("redirect_uri is missing.");
        }

        return processTokenExchange(
                requestBody.getCode(),
                requestBody.getRedirectUri(),
                false
        );
    }

    @GetMapping("/callback")
    public ResponseEntity<?> callbackGet(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String redirectUri) {
        
        if (code == null) {
            return ResponseEntity.badRequest().body("Authorization code is missing.");
        }
        
        String redirectUri2 = myRedirectUri;
        
        return processTokenExchange(code, redirectUri2, true);
    }

    private ResponseEntity<?> processTokenExchange(String code, String redirectUri, boolean isGetRequest) {
        try {
            System.out.println("Primljen kod: " + code);
            System.out.println("Primljen redirect_uri: " + redirectUri);

            RestTemplate restTemplate = new RestTemplate();
            String tokenUrl = "https://oauth2.googleapis.com/token";

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", "?");
            params.add("client_secret", "?");
            params.add("redirect_uri", myRedirectUri);
            params.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, request, Map.class);

            if (tokenResponse.getBody() == null || !tokenResponse.getBody().containsKey("access_token")) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error during Google OAuth: Access token is missing from Google response");
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);

            HttpEntity<Void> userRequest = new HttpEntity<>(userHeaders);
            ResponseEntity<Map> userInfo = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    userRequest,
                    Map.class
            );

            Map<String, Object> userData = userInfo.getBody();
            if (userData == null || !userData.containsKey("email")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Error: Unable to retrieve user email from Google.");
            }

            String email = (String) userData.get("email");
            /*
            if (!ALLOWED_EMAIL.equalsIgnoreCase(email)) {
                System.err.println("Pokušaj neovlaštene prijave s e-maila: " + email);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access denied: Only " + ALLOWED_EMAIL + " is authorized to use this application.");
            }
            */
            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
/*
            // Ako je GET zahtjev (direktni redirect od Google-a), vraćamo HTML koji zatvara prozor
            if (isGetRequest) {
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonUser = objectMapper.writeValueAsString(userData);

                String htmlResponse = jsonUser;

                responseHeaders.setContentType(MediaType.APPLICATION_JSON);
                return new ResponseEntity<>(htmlResponse, responseHeaders, HttpStatus.OK);
            }
*/
            
        
            if (isGetRequest) {
                ObjectMapper objectMapper = new ObjectMapper();
                String jsonUser = objectMapper.writeValueAsString(userData);

                String baseUrl = myRedirectUri;
                int lastIndex = myRedirectUri.lastIndexOf("/auth/callback");

                if (lastIndex != -1) {
                    baseUrl = myRedirectUri.substring(0, lastIndex);
                }

                String targetUrl = baseUrl + "/auth/login";

                String htmlResponse = "<!DOCTYPE html>" +
                        "<html>" +
                        "<head>" +
                        "  <title>Prijava uspješna</title>" +
                        "</head>" +
                        "<body>" +
                        "<script>" +
                        "  try {" +
                        "    const userData = " + jsonUser + ";" +
                        "    if (window.opener) {" +
                        "      window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: userData }, '*');" +
                        "      window.close();" +
                        "    } else {" +
                        "      localStorage.setItem('google_user', JSON.stringify(userData));" +
                        "      window.location.replace('" + targetUrl + "');" +
                        "      window.close();" +
                        "    }" +
                        "  } catch (e) {" +
                        "    console.error(e);" +
                        "    document.body.innerHTML = '<p style=\"color: red;\">Greška kod prijave: ' + e.message + '</p>';" +
                        "  }" +
                        "</script>" +
                        "<p>Prijava uspješna. Preusmjeravanje...</p>" +
                        "</body>" +
                        "</html>";

                responseHeaders.setContentType(MediaType.TEXT_HTML);
                return new ResponseEntity<>(htmlResponse, responseHeaders, HttpStatus.OK);
            }

            // Za klasični POST zahtjev vraćamo JSON kao i do sada
            return new ResponseEntity<>(userData, responseHeaders, HttpStatus.OK);

        } catch (HttpClientErrorException e) {
            System.err.println("Google API Error Response: " + e.getResponseBodyAsString());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Google API Error: " + redirectUri + " " + e.getResponseBodyAsString());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during Google OAuth: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/redirect-uri", method = {RequestMethod.POST, RequestMethod.OPTIONS})
    public ResponseEntity<?> receiveRedirectUri(
            @RequestBody(required = false) Map<String, String> payload,
            jakarta.servlet.http.HttpServletRequest request) {
        
        // Ako je preflight OPTIONS zahtjev, odmah vrati OK da spriječiš 405
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return ResponseEntity.ok().build();
        }

        if (payload == null) {
            return ResponseEntity.badRequest().body("Payload nedostaje.");
        }

        String redirectUri = payload.get("redirectUri");

        if (redirectUri == null || redirectUri.isBlank()) {
            return ResponseEntity.badRequest()
                    .body("redirectUri nedostaje.");
        }

        System.out.println("Primljen redirectUri: " + redirectUri);

        myRedirectUri = redirectUri;

        return ResponseEntity.ok(
                Map.of("redirectUri", redirectUri)
        );
    }
}