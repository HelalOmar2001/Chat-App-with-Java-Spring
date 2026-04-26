-- V5__create_messages_table.sql
CREATE TABLE IF NOT EXISTS messages (
                                        id      UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    chat_id UUID         NOT NULL,

    CONSTRAINT fk_messages_chat FOREIGN KEY (chat_id) REFERENCES chats (id)
    );