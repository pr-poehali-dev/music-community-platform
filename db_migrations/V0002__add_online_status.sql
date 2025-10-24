ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE users SET is_online = true WHERE id IN (1, 2);
UPDATE users SET is_online = false WHERE id = 3;