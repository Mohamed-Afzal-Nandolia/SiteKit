package com.sitekit.userManagementModule.controller;

import com.sitekit.userManagementModule.model.UserDTO;
import com.sitekit.userManagementModule.service.UserService;
import com.sitekit.securityModule.model.Token;
import com.sitekit.utilityModule.constants.APIEndpoints;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping(APIEndpoints.BASE_VERSION)
public class UserController {

    private final UserService userService;

    @GetMapping(APIEndpoints.GET_ALL_USERS)
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping(APIEndpoints.GET_USER_BY_ID)
    public ResponseEntity<UserDTO> getUserById(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.getUserById(userDTO));
    }

    @DeleteMapping(APIEndpoints.DELETE_USER)
    public ResponseEntity<UserDTO> deleteUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.deleteUser(userDTO));
    }

}
