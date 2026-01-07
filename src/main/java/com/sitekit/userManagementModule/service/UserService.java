package com.sitekit.userManagementModule.service;

import com.sitekit.userManagementModule.model.UserDTO;

import java.util.List;

public interface UserService {

    public List<UserDTO> getAllUsers();

    public UserDTO getUserById(UserDTO userDTO);

    public UserDTO createUser(UserDTO user);

    public UserDTO updateUser(UserDTO user);

    public UserDTO deleteUser(UserDTO userDTO);
}
