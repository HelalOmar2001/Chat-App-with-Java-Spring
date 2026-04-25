package com.helal.chatapp.controller;

import com.helal.chatapp.DTO.ChatParticipantDto;
import com.helal.chatapp.service.ChatParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "api/v1/chatParticipants")
public class ChatParticipantController {

    private final ChatParticipantService participantService;

    @PostMapping
    public ResponseEntity<Long> createChatParticipant(
            @RequestBody ChatParticipantDto chatParticipantDto
            ){
        return ResponseEntity.ok(participantService.createChatParticipant(chatParticipantDto));
    }

    @GetMapping
    public ResponseEntity<List<ChatParticipantDto>> findAll(){
        return ResponseEntity.ok(participantService.getChatParticipants());
    }

    @GetMapping("/{participant-id}")
    public ResponseEntity<ChatParticipantDto> findChatParticipant(
            @PathVariable("participant-id") Long id
    ){
        return ResponseEntity.ok(participantService.getChatParticipant(id));
    }

    @DeleteMapping("/{participant-id}")
    public ResponseEntity<Void> deleteChatParticipant(
            @PathVariable("participant-id") Long id
    ){
        participantService.deleteChatParticipant(id);
        return ResponseEntity.accepted().build();
    }

    @PutMapping
    public ResponseEntity<Long> updateChatParticipant(
            @RequestBody ChatParticipantDto chatParticipantDto
    ){
        return ResponseEntity.accepted().body(participantService.updateChatParticipant(chatParticipantDto));
    }
}
