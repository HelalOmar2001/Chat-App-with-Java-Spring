package com.helal.chatapp.DTO;

import com.helal.chatapp.entity.User;

public record UserDto(
        Long id,
        String name
) {

    public UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName()
        );
    }

    public User toUser(UserDto userDto) {
        return User.builder()
                .id(userDto.id())
                .name(userDto.name())
                .build();
    }
}
