-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(300) NOT NULL,
    artist VARCHAR(300) NOT NULL,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    duration INTEGER,
    plays_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes table
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    track_id INTEGER REFERENCES tracks(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, track_id)
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    track_id INTEGER REFERENCES tracks(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chats table
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id),
    user2_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    sender_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo users
INSERT INTO users (username, display_name, avatar_url, bio) VALUES
('djmax', 'DJ Max', 'https://api.dicebear.com/7.x/avataaars/svg?seed=djmax', 'Music producer & DJ'),
('beatmaker', 'BeatMaker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaker', 'Creating beats since 2015'),
('vocalize', 'Vocalize', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vocalize', 'Singer & Songwriter');

-- Insert demo tracks
INSERT INTO tracks (user_id, title, artist, audio_url, cover_url, duration) VALUES
(1, 'Summer Vibes', 'DJ Max', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 180),
(2, 'Night City', 'BeatMaker', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400', 210),
(3, 'Ocean Dreams', 'Vocalize', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 195);

-- Insert demo likes
INSERT INTO likes (user_id, track_id) VALUES
(1, 2), (1, 3), (2, 1), (2, 3), (3, 1);

-- Insert demo comments
INSERT INTO comments (user_id, track_id, content) VALUES
(2, 1, 'Amazing track! Love the vibe 🔥'),
(3, 1, 'This is so good! Can''t stop listening'),
(1, 2, 'Your beats are incredible!');

-- Insert demo chat
INSERT INTO chats (user1_id, user2_id) VALUES (1, 2), (1, 3);

-- Insert demo messages
INSERT INTO messages (chat_id, sender_id, content) VALUES
(1, 1, 'Hey! Love your new track!'),
(1, 2, 'Thanks! Working on more beats'),
(2, 3, 'Want to collaborate on a song?'),
(2, 1, 'Absolutely! Let''s do it');