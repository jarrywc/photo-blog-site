-- Create codes table for signup functionality
CREATE TABLE codes (
  code TEXT PRIMARY KEY,
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  type TEXT NOT NULL DEFAULT 'signup',
  target TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME,
  used_by_user_id INTEGER,
  FOREIGN KEY (used_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for better performance on datetime queries
CREATE INDEX idx_codes_start_end_datetime ON codes(start_datetime, end_datetime);
CREATE INDEX idx_codes_type ON codes(type);
CREATE INDEX idx_codes_used_at ON codes(used_at);