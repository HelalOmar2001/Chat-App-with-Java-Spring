package com.helal.chatapp.service;

import com.helal.chatapp.DTO.UserDto;
import com.helal.chatapp.entity.User;
import com.helal.chatapp.repository.ChatParticipantRepository;
import com.helal.chatapp.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ChatParticipantRepository participantRepository;

    public Long createUser(UserDto userDto){
        return userRepository.save(UserDto.toUser(userDto)).getId();
    }

    public void deleteUser(Long id){
        userRepository.deleteById(id);
    }

    public Long updateUser(UserDto userDto){
        var user = userRepository.findById(userDto.id())
                .orElseThrow(()->new NullPointerException("test"));
        mergeUser(user,userDto);
        return userRepository.save(user).getId();
    }

    private void mergeUser(User user, UserDto userDto) {
        if (StringUtils.isNotBlank(userDto.name()))
            user.setName(userDto.name());
    }

    public UserDto getUser(Long id){
        return userRepository.findById(id).map(UserDto::toDto)
                .orElseThrow(()->new NullPointerException("test"));
    }

    public List<UserDto> getUsers(){
        return userRepository.findAll()
                .stream().map(UserDto::toDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> getUsersByChat(UUID id){
        return participantRepository.findUsersByChat_Id(id)
                .stream().map(UserDto::toDto)
                .collect(Collectors.toList());
    }
}
