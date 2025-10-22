-- Migration: Add detailed video session fields to visitors table
-- Store room ID, session ID, and URLs for video calls

-- Add new columns for video session details
ALTER TABLE visitors ADD COLUMN video_room_id TEXT;
ALTER TABLE visitors ADD COLUMN video_host_url TEXT;
ALTER TABLE visitors ADD COLUMN video_guest_url TEXT;

-- Create index for video session lookups
CREATE INDEX IF NOT EXISTS idx_video_session ON visitors(video_session_id);
CREATE INDEX IF NOT EXISTS idx_video_room ON visitors(video_room_id);

