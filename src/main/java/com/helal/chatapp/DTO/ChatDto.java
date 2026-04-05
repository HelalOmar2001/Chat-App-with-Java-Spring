package com.helal.chatapp.DTO;

import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.entity.Message;

import java.util.Optional;
import java.util.UUID;

public record ChatDto(
        UUID id,
        Boolean isGroupChat
) {
    public ChatDto toDto(Chat chat) {
        return new ChatDto(
                chat.getId(),
                chat.getIsGroupChat()
        );
    }

    public Chat toChat(ChatDto chatDto) {
        return Chat.builder()
                .id(chatDto.id)
                .isGroupChat(chatDto.isGroupChat)
                .build();
    }
}
