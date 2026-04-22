package com.helal.chatapp.service;

import com.helal.chatapp.DTO.MessageDto;
import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.entity.Message;
import com.helal.chatapp.repository.MessageRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    public UUID createMessage(MessageDto messageDto){
        return messageRepository.save(MessageDto.fromDto(messageDto)).getId();
    }

    public void deleteMessage(UUID id){
        messageRepository.deleteById(id);
    }

    public UUID updateMessage(MessageDto messageDto){
        var message = messageRepository.findById(messageDto.id())
                .orElseThrow(()->new NullPointerException("test"));
        mergeMessage(message, messageDto);
        return messageRepository.save(message).getId();
    }

    private void mergeMessage(Message message, MessageDto messageDto) {
        if(messageDto.chatId() != null)
            message.setChat(Chat.builder().id(messageDto.chatId()).build());
        if(StringUtils.isNotBlank(messageDto.message()))
            message.setMessage(messageDto.message());
    }

    public MessageDto getMessage(UUID id){
        return messageRepository.findById(id).map(MessageDto::toDto).orElseThrow(
                ()->new NullPointerException("test")
        );
    }

    public List<MessageDto> getMessages(){
        return messageRepository.findAll()
                .stream().map(MessageDto::toDto)
                .collect(Collectors.toList());
    }

    public List<MessageDto> getMessagesByChat(UUID id){
        return messageRepository.getMessagesByChat_Id(id)
                .stream().map(MessageDto::toDto)
                .collect(Collectors.toList());
    }

}
