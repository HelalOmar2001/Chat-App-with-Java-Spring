package com.helal.chatapp.controller;

import com.helal.chatapp.DTO.MessageDto;
import com.helal.chatapp.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "api/v1/messages")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<UUID> createMessage(
            @RequestBody MessageDto messageDto
            ){
        return ResponseEntity.ok(messageService.createMessage(messageDto));
    }

    @GetMapping
    public ResponseEntity<List<MessageDto>> findAll(){
        return ResponseEntity.ok(messageService.getMessages());
    }

    @GetMapping("/{chat-id}")
    public ResponseEntity<List<MessageDto>> findMessagesByChatId(
            @PathVariable("chat-id") UUID id
    ){
        return ResponseEntity.ok(messageService.getMessagesByChat(id));
    }

    @GetMapping("/{message-id}")
    public ResponseEntity<MessageDto> findMessage(
            @PathVariable("message-id") UUID id
    ){
        return ResponseEntity.ok(messageService.getMessage(id));
    }

    @DeleteMapping("/{message-id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable("message-id") UUID id
    ){
        messageService.deleteMessage(id);
        return ResponseEntity.accepted().build();
    }

    @PutMapping
    public ResponseEntity<UUID> updateMessage(
            @RequestBody MessageDto messageDto
    ){
        return ResponseEntity.accepted().body(messageService.updateMessage(messageDto));
    }
}
