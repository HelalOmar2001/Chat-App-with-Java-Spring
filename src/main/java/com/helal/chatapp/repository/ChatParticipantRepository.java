package com.helal.chatapp.repository;

import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.entity.ChatParticipant;
import com.helal.chatapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    List<Chat> findChatsByUser_Id(Long userId);

    List<User> findUsersByChat_Id(UUID chatId);
}
