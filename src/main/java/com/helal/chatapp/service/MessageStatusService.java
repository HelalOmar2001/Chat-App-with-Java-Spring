package com.helal.chatapp.service;

import com.helal.chatapp.DTO.MessageStatusDto;
import com.helal.chatapp.entity.ChatParticipant;
import com.helal.chatapp.entity.Message;
import com.helal.chatapp.entity.MessageStatus;
import com.helal.chatapp.repository.MessageStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageStatusService {

    private final MessageStatusRepository messageStatusRepository;

    public UUID createMessageStatus(MessageStatusDto messageStatusDto){
        return messageStatusRepository.save(MessageStatusDto.fromDto(messageStatusDto)).getId();
    }

    public void deleteMessageStatus(UUID id){
        messageStatusRepository.deleteById(id);
    }

    public UUID updateMessageStatus(MessageStatusDto messageStatusDto){
        var messageStatus = messageStatusRepository.findById(messageStatusDto.id())
                .orElseThrow(()->new NullPointerException("test"));
        mergeMessageStatus(messageStatus,messageStatusDto);
        return messageStatusRepository.save(messageStatus).getId();
    }

    private void mergeMessageStatus(MessageStatus messageStatus, MessageStatusDto messageStatusDto) {
        if(messageStatusDto.messageId()!= null)
            messageStatus.setMessage(Message.builder().id(messageStatusDto.messageId()).build());
        if(messageStatusDto.chatParticipantId()!= null)
            messageStatus.setChatParticipant(ChatParticipant.builder().id(messageStatusDto.chatParticipantId()).build());
        if(messageStatusDto.status()!= null)
            messageStatus.setStatus(messageStatusDto.status());
    }

    public MessageStatusDto getMessageStatus(UUID id){
        return messageStatusRepository.findById(id).map(MessageStatusDto::toDto)
                .orElseThrow(()-> new NullPointerException("test"));
    }

    public List<MessageStatusDto> getMessageStatuses(){
        return messageStatusRepository.findAll().stream().map(MessageStatusDto::toDto)
                .collect(Collectors.toList());
    }
}
