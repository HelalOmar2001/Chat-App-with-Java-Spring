package com.helal.chatapp.service;

import com.helal.chatapp.DTO.ChatParticipantDto;
import com.helal.chatapp.entity.Chat;
import com.helal.chatapp.entity.ChatParticipant;
import com.helal.chatapp.entity.User;
import com.helal.chatapp.repository.ChatParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatParticipantService {

    private final ChatParticipantRepository chatParticipantRepository;

    public Long createChatParticipant(ChatParticipantDto chatParticipantDto){
        return chatParticipantRepository.save(ChatParticipantDto.fromDto(chatParticipantDto)).getId();
    }

    public void deleteChatParticipant(Long id){
        chatParticipantRepository.deleteById(id);
    }

    public Long updateChatParticipant(ChatParticipantDto chatParticipantDto){
        var chatParticipant = chatParticipantRepository.findById(chatParticipantDto.id())
                .orElseThrow(()-> new NullPointerException("test"));
        mergeChatParticipant(chatParticipant,chatParticipantDto);
        return chatParticipantRepository.save(chatParticipant).getId();
    }

    private void mergeChatParticipant(ChatParticipant chatParticipant, ChatParticipantDto chatParticipantDto) {
        if (chatParticipantDto.chatId() != null)
            chatParticipant.setChat(Chat.builder().id(chatParticipantDto.chatId()).build());
        if (chatParticipantDto.userId() != null)
            chatParticipant.setUser(User.builder().id(chatParticipantDto.userId()).build());
        if (chatParticipantDto.role() != null)
            chatParticipant.setRole(chatParticipantDto.role());
    }

    public ChatParticipantDto getChatParticipant(Long id){
        return chatParticipantRepository.findById(id).map(ChatParticipantDto::toDto)
                .orElseThrow(()->new NullPointerException("test"));
    }

    public List<ChatParticipantDto> getChatParticipants(){
        return chatParticipantRepository.findAll().stream()
                .map(ChatParticipantDto::toDto)
                .collect(Collectors.toList());
    }
}
