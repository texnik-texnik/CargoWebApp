-- Migration: Add archived field to tracks table
-- Description: Add boolean field to mark old tracks (4+ months) as archived

-- Add archived column (default false)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add archived_at timestamp to track when it was archived
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on archived + intransit_date
CREATE INDEX IF NOT EXISTS idx_tracks_archived_intransit ON tracks (archived, intransit_date DESC);

-- Create index for archived_at
CREATE INDEX IF NOT EXISTS idx_tracks_archived_at ON tracks (archived_at DESC);

-- Optional: Add comment
COMMENT ON COLUMN tracks.archived IS 'True if track is older than 4 months from intransit_date';
COMMENT ON COLUMN tracks.archived_at IS 'Timestamp when the track was archived';
