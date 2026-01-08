package com.sitekit.userManagementModule.service;

import com.sitekit.userManagementModule.model.UserDTO;
import com.sitekit.securityModule.model.Token;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

public interface UserService {

    public List<UserDTO> getAllUsers();

    public UserDTO getUserById(UserDTO userDTO);

    public Token createUser(UserDTO user, HttpServletResponse response);

    public UserDTO updateUser(UserDTO user);

    public UserDTO deleteUser(UserDTO userDTO);
}
