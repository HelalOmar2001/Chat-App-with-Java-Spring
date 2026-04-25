package com.helal.chatapp.controller;

import com.helal.chatapp.DTO.MessageStatusDto;
import com.helal.chatapp.service.MessageStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(path = "api/v1/messageStatuses")
public class MessageStatusController {

    private final MessageStatusService messageStatusService;

    @PostMapping
    public ResponseEntity<UUID> createMessageStatus(
            @RequestBody MessageStatusDto messageStatusDto
            ){
        return ResponseEntity.ok(messageStatusService.createMessageStatus(messageStatusDto));
    }

    @GetMapping
    public ResponseEntity<List<MessageStatusDto>> findAll(){
        return ResponseEntity.ok(messageStatusService.getMessageStatuses());
    }

    @GetMapping("/{status-id}")
    public ResponseEntity<MessageStatusDto> findMessageStatus(
            @PathVariable("status-id") UUID id
    ){
        return ResponseEntity.ok(messageStatusService.getMessageStatus(id));
    }

    @DeleteMapping("/{status-id}")
    public ResponseEntity<Void> deleteMessageStatus(
            @PathVariable("status-id") UUID id
    ){
        messageStatusService.deleteMessageStatus(id);
        return ResponseEntity.accepted().build();
    }

    @PutMapping
    public ResponseEntity<UUID> updateMessageStatus(
            @RequestBody MessageStatusDto messageStatusDto
    ){
        return ResponseEntity.accepted().body(messageStatusService.updateMessageStatus(messageStatusDto));
    }

}
