package com.sitekit.userManagementModule.service.impl;

import com.sitekit.securityModule.config.JwtUtil;
import com.sitekit.securityModule.model.Token;
import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.userManagementModule.model.UserDTO;
import com.sitekit.userManagementModule.repository.UserRepository;
import com.sitekit.userManagementModule.service.UserService;
import com.sitekit.utilityModule.enums.Role;
import com.sitekit.utilityModule.exceptions.ResourceNotFoundException;
import com.sitekit.utilityModule.UtilClass.UserUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final UserUtils userUtils;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public List<UserDTO> getAllUsers() {
        List<UserEntity> allUsers = userRepository.findAll();
        return allUsers.stream().map(user -> modelMapper.map(user, UserDTO.class)).toList();
    }

    @Override
    public UserDTO getUserById(UserDTO userDTO) {
        UserEntity userEntity = userUtils.getUserById(userDTO.getId());
        return modelMapper.map(userEntity, UserDTO.class);
    }

    @Override
    public Token createUser(UserDTO user, HttpServletResponse response) {
        if (!userUtils.checkUserExists(user.getEmailAddress())) {
            throw new ResourceNotFoundException("User already exists with email: " + user.getEmailAddress());
        }

        LocalDateTime now = LocalDateTime.now();

        UserEntity userEntity = modelMapper.map(user, UserEntity.class);
        userEntity.setPassword(passwordEncoder.encode(userEntity.getPassword()));
        userEntity.setRole(Role.USER);
        userEntity.setCreatedOn(now);
        userEntity.setLastUpdatedOn(now);

        UserEntity savedUser = userRepository.save(userEntity);

        String accessToken = jwtUtil.generateAccessToken(
                savedUser.getEmailAddress(),
                savedUser.getRole().toString(),
                savedUser.getId()
            );

        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getEmailAddress());

        Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/auth/refresh");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(refreshCookie);

        return new Token(accessToken);
    }

    @Override
    public UserDTO updateUser(UserDTO user) {
        return null;
    }

    @Override
    public UserDTO deleteUser(UserDTO userDTO) {
        UserEntity user = userUtils.getUserById(userDTO.getId());
        userRepository.delete(user);
        return modelMapper.map(user, UserDTO.class);
    }
}
