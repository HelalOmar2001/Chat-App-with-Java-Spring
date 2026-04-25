package com.helal.chatapp.controller;

import com.helal.chatapp.DTO.ChatDto;
import com.helal.chatapp.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/chats")
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<UUID> createChat(
            @RequestBody ChatDto chatDto
            ){
        return ResponseEntity.ok(chatService.createChat(chatDto));
    }

    @GetMapping
    public ResponseEntity<List<ChatDto>> findAll(){
        return ResponseEntity.ok(chatService.getChats());
    }

    @GetMapping(path = "/chat-id")
    public ResponseEntity<ChatDto> findChat(
            @PathVariable("chat-id") UUID id
    ){
        return ResponseEntity.ok(chatService.getChat(id));
    }

    @GetMapping(path = "/user-id")
    public ResponseEntity<List<ChatDto>> findChatsById(
            @PathVariable("user-id") Long id
    ){
        return ResponseEntity.ok(chatService.getChatsByUser(id));
    }

    @DeleteMapping(path = "/chat-id")
    public ResponseEntity<ChatDto> deleteChat(
            @PathVariable("chat-id") UUID id
    ){
        chatService.deleteChat(id);
        return ResponseEntity.accepted().build();
    }

    @GetMapping
    public ResponseEntity<UUID> updateChat(
            @RequestBody ChatDto chatDto
    ){
        return ResponseEntity.accepted().body(chatService.updateChat(chatDto));
    }
}
