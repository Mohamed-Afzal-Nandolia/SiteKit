package com.sitekit.securityModule.config;


import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.userManagementModule.repository.UserRepository;
import com.sitekit.utilityModule.UtilClass.UserUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserUtils userUtils;

    @Override
    public UserDetails loadUserByUsername(String emailAddress) throws UsernameNotFoundException {
        UserEntity user = userUtils.getUserByEmail(emailAddress);

        return new CustomUserDetails(
                user.getId(), // we are not sending the userid for any request it auto fetches from jwt session
                user.getEmailAddress(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
