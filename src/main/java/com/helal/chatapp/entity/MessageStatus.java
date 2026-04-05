package com.helal.chatapp.entity;

import com.helal.chatapp.util.enums.MessageStatusEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "message_status")
public class MessageStatus {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id",nullable = false)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_participant_id",nullable = false)
    private ChatParticipant chatParticipant;

    @Enumerated(EnumType.STRING)
    private MessageStatusEnum status;

}
