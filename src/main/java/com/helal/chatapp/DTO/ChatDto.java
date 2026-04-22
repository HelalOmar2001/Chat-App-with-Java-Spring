package com.helal.chatapp.DTO;

import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.entity.Message;

import java.util.Optional;
import java.util.UUID;

public record ChatDto(
        UUID id,
        Boolean isGroupChat,
        String chatName
) {
    public static ChatDto toDto(Chat chat) {
        return new ChatDto(
                chat.getId(),
                chat.getIsGroupChat(),
                chat.getChatName()
        );
    }

    public static Chat fromDto(ChatDto chatDto) {
        return Chat.builder()
                .id(chatDto.id)
                .isGroupChat(chatDto.isGroupChat)
                .chatName(chatDto.chatName)
                .build();
    }
}
