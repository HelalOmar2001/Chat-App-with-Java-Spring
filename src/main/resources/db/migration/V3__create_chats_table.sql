-- V3__create_chats_table.sql
CREATE TABLE IF NOT EXISTS chats (
                                     id            UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    is_group_chat BOOLEAN      NOT NULL,
    chat_name     VARCHAR(255)
    );