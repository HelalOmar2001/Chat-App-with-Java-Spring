package com.helal.chatapp.controller;

import com.helal.chatapp.DTO.UserDto;
import com.helal.chatapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "/api/v1/users")
public class UserController {

    private final UserService service;

    @PostMapping
    public ResponseEntity<Long> createUser(
            @RequestBody UserDto userDto
            ){
        return ResponseEntity.ok(service.createUser(userDto));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> findAll() {
        return ResponseEntity.ok(service.getUsers());
    }

    @GetMapping(path = "/{user-id}")
    public ResponseEntity<UserDto> findUser(
            @PathVariable("user-id") Long id
    ){
        return ResponseEntity.ok(service.getUser(id));
    }

    @DeleteMapping(path = "/{user-id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("user-id") Long id
    ){
        service.deleteUser(id);
        return ResponseEntity.accepted().build();
    }

    @PutMapping
    public ResponseEntity<Long> updateUser(
            @RequestBody UserDto userDto
    ){
        return ResponseEntity.accepted().body(service.updateUser(userDto));
    }
}
