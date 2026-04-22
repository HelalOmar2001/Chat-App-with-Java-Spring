package com.helal.chatapp.DTO;

import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.entity.Message;

import java.util.UUID;

public record MessageDto (
        UUID id,
        String message,
        UUID chatId
){
    public static MessageDto toDto(Message message){
        return new MessageDto(
                message.getId(),
                message.getMessage(),
                message.getChat().getId()
        );
    }

    public static Message fromDto(MessageDto messageDto){
        return Message.builder()
                .id(messageDto.id())
                .message(messageDto.message())
                .chat(
                        Chat.builder()
                                .id(messageDto.chatId())
                                .build()
                ).build();
    }
}
