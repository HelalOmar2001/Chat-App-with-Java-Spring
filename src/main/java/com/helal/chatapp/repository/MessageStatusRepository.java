package com.helal.chatapp.repository;

import com.helal.chatapp.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MessageStatusRepository extends JpaRepository<MessageStatus, UUID> {
}
