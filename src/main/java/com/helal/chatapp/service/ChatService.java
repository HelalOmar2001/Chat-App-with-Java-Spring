package com.helal.chatapp.service;

import com.helal.chatapp.DTO.ChatDto;
import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.repository.ChatParticipantRepository;
import com.helal.chatapp.repository.ChatRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository repository;
    private final ChatParticipantRepository participantRepository;

    public UUID createChat(ChatDto chatDto) {
        return repository.save(ChatDto.fromDto(chatDto)).getId();
    }

    //TODO: Implement exceptions
    public ChatDto getChat(UUID id) {
        return repository.findById(id).map(ChatDto::toDto)
                .orElseThrow(()->new NullPointerException("test"));
    }

    //Todo:Implement get chats
    public List<ChatDto> getChats() {
        return repository.findAll().stream().map(ChatDto::toDto).collect(Collectors.toList());
    }

    public void deleteChat(UUID id) {
        repository.deleteById(id);
    }

    public UUID updateChat(ChatDto chatDto) {
        Chat chat = repository.findById(chatDto.id()).orElseThrow(
                ()-> new NullPointerException("Test")
        );
        mergeChat(chat, chatDto);
        return repository.save(chat).getId();
    }

    private void mergeChat(Chat chat,ChatDto request) {
        if(StringUtils.isNotBlank(request.chatName())){
            chat.setChatName(request.chatName());
        }
        if (request.isGroupChat() != null) {
            chat.setIsGroupChat(request.isGroupChat());
        }
    }

    public List<ChatDto> getChatsByUser(Long id){
        return participantRepository.findChatsByUser_Id(id)
                .stream()
                .map(ChatDto::toDto)
                .collect(Collectors.toList());
    }

}
