package com.sitekit.utilityModule.UtilClass;

import com.sitekit.securityModule.config.CustomUserDetails;
import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.userManagementModule.repository.UserRepository;
import com.sitekit.utilityModule.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@RequiredArgsConstructor
@Configuration
public class UserUtils {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity getUserById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public boolean checkUserExists(String emailAddress){
        Optional<UserEntity> user = userRepository.findByEmailAddress(emailAddress);
        return user.isEmpty();
    }

    public UserEntity getUserByEmail(String emailAddress){
        return userRepository.findByEmailAddress(emailAddress)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public Long getLoggedInUserId() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) auth.getPrincipal();

        return userDetails.getId();
    }

    public UserEntity getLoggedInUser() {
        return userRepository.findById(getLoggedInUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Logged-in user not found"));
    }

}
