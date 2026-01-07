package com.sitekit.utilityModule.userUtils;

import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.userManagementModule.repository.UserRepository;
import com.sitekit.utilityModule.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

@RequiredArgsConstructor
@Configuration
public class UserUtils {

    private final UserRepository userRepository;

    public UserEntity getUserById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public boolean checkUserExists(String emailAddress){
        Optional<UserEntity> user = userRepository.findByEmailAddress(emailAddress);
        return user.isEmpty();
    }

}
