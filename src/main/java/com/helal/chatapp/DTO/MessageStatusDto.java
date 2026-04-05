package com.helal.chatapp.DTO;

import com.helal.chatapp.entity.ChatParticipant;
import com.helal.chatapp.entity.Message;
import com.helal.chatapp.entity.MessageStatus;
import com.helal.chatapp.util.enums.MessageStatusEnum;

import java.util.UUID;

public record MessageStatusDto(
        UUID id,
        UUID messageId,
        Long chatParticipantId,
        MessageStatusEnum status
) {
    public MessageStatusDto toDto(MessageStatus messageStatus) {
        return new MessageStatusDto(
                messageStatus.getId(),
                messageStatus.getMessage().getId(),
                messageStatus.getChatParticipant().getId(),
                messageStatus.getStatus()
        );
    }

    public MessageStatus fromDto(MessageStatusDto messageStatusDto) {
        return MessageStatus.builder()
                .id(messageStatusDto.id())
                .message(
                        Message.builder()
                                .id(messageStatusDto.messageId())
                                .build()
                )
                .chatParticipant(
                        ChatParticipant.builder()
                                .id(messageStatusDto.chatParticipantId())
                                .build()
                ).status(messageStatusDto.status())
                .build();
    }
}
