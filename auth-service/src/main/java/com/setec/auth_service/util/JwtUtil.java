package com.setec.auth_service.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    // This should ideally be externalized to application.yaml in a real production system.
    // We generate a safe key for HS256 algorithm.
    private static final String SECRET_KEY_STRING = "9E8B4C2D1F3A5E7D8C9B0A1F2E3D4C5B6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D";
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY_STRING.getBytes());
    
    // 7 days expiration for convenience
    private final long JWT_EXPIRATION = 7L * 24L * 60L * 60L * 1000L;

    public String generateToken(String username, List<String> permissions) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION);

        return Jwts.builder()
                .setSubject(username)
                .claim("permissions", permissions)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
