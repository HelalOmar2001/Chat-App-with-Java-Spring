-- V2__create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
                                     id   BIGSERIAL    PRIMARY KEY,
                                     name VARCHAR(255) NOT NULL
    );