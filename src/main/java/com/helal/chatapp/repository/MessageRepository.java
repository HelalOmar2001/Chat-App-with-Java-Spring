package com.helal.chatapp.repository;

import com.helal.chatapp.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> getMessagesByChat_Id(UUID chatId);
}
