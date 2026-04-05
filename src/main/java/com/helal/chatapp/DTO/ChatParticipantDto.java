package com.helal.chatapp.DTO;

import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.entity.ChatParticipant;
import com.helal.chatapp.entity.User;
import com.helal.chatapp.util.enums.RoleEnum;

import java.util.UUID;

public record ChatParticipantDto(
        Long id,
        Long userId,
        UUID chatId,
        RoleEnum role
) {
    public ChatParticipantDto toDto(ChatParticipant chatParticipant) {
        return new ChatParticipantDto(
                chatParticipant.getId(),
                chatParticipant.getUser().getId(),
                chatParticipant.getChat().getId(),
                chatParticipant.getRole()
        );
    }

    public ChatParticipant toChatParticipant(ChatParticipantDto chatParticipantDto) {
        return ChatParticipant.builder()
                .id(chatParticipantDto.id())
                .user(
                        User.builder()
                                .id(chatParticipantDto.userId())
                                .build()
                ).chat(
                        Chat.builder()
                                .id(chatParticipantDto.chatId())
                                .build()
                ).role(chatParticipantDto.role())
                .build();
    }
}
