-- V4__create_chat_participants_table.sql
CREATE TABLE IF NOT EXISTS chat_participants (
                                                 id      BIGINT       NOT NULL DEFAULT nextval('chat_participants_seq') PRIMARY KEY,
    user_id BIGINT       NOT NULL,
    chat_id UUID         NOT NULL,
    role    VARCHAR(50),

    CONSTRAINT fk_chat_participants_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_chat_participants_chat FOREIGN KEY (chat_id) REFERENCES chats (id)
    );