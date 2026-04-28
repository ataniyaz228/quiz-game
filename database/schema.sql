-- ============================================
-- Quiz Battle Жүйесі — Мәліметтер Базасы
-- ============================================

CREATE TABLE Users (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'player'
);

CREATE TABLE Questions (
    id             SERIAL PRIMARY KEY,
    question_text  TEXT         NOT NULL,
    option_a       VARCHAR(255) NOT NULL,
    option_b       VARCHAR(255) NOT NULL,
    option_c       VARCHAR(255) NOT NULL,
    option_d       VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(1)   NOT NULL
        CHECK (correct_answer IN ('A','B','C','D'))
);

-- Games.player1_id, player2_id, winner_id → Users.id
CREATE TABLE Games (
    id         SERIAL PRIMARY KEY,
    player1_id INTEGER NOT NULL
        REFERENCES Users(id) ON DELETE CASCADE,
    player2_id INTEGER NOT NULL
        REFERENCES Users(id) ON DELETE CASCADE,
    winner_id  INTEGER
        REFERENCES Users(id) ON DELETE SET NULL
);`;