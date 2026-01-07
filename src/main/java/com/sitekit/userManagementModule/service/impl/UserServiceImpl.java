package com.sitekit.userManagementModule.service.impl;

import com.sitekit.userManagementModule.entity.UserEntity;
import com.sitekit.userManagementModule.model.UserDTO;
import com.sitekit.userManagementModule.repository.UserRepository;
import com.sitekit.userManagementModule.service.UserService;
import com.sitekit.utilityModule.enums.Role;
import com.sitekit.utilityModule.exceptions.ResourceNotFoundException;
import com.sitekit.utilityModule.userUtils.UserUtils;
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
    public UserDTO createUser(UserDTO user) {
        if(!userUtils.checkUserExists(user.getEmailAddress())){
            throw new ResourceNotFoundException("User already exists with email: " + user.getEmailAddress());
        }
        LocalDateTime now = LocalDateTime.now();

        UserEntity userEntity = modelMapper.map(user, UserEntity.class);
        userEntity.setPassword(passwordEncoder.encode(userEntity.getPassword()));
        userEntity.setRole(Role.USER);
        userEntity.setCreatedOn(now);
        userEntity.setLastUpdatedOn(now);

        return modelMapper.map(userRepository.save(userEntity), UserDTO.class);
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
