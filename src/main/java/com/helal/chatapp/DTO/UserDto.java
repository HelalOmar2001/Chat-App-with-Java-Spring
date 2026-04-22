package com.helal.chatapp.DTO;

import com.helal.chatapp.entity.User;

public record UserDto(
        Long id,
        String name
) {

    public static UserDto toDto(User user) {
        return new UserDto(
                user.getId(),
                user.getName()
        );
    }

    public static User toUser(UserDto userDto) {
        return User.builder()
                .id(userDto.id())
                .name(userDto.name())
                .build();
    }
}
