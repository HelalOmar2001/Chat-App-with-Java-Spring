-- V6__create_message_status_table.sql
CREATE TABLE IF NOT EXISTS message_status (
                                              id                  UUID   NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id          UUID   NOT NULL,
    chat_participant_id BIGINT NOT NULL,
    status              VARCHAR(50),

    CONSTRAINT fk_message_status_message          FOREIGN KEY (message_id)          REFERENCES messages          (id),
    CONSTRAINT fk_message_status_chat_participant FOREIGN KEY (chat_participant_id) REFERENCES chat_participants (id)
    );