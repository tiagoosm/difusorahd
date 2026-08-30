-- ============================================================================
-- Migration: increase the news media bucket's file size limit
-- Run this file in the Supabase SQL Editor (existing project).
-- ============================================================================

-- The 20 MB limit (shared with the image bucket) was too low for narration
-- audio: an uncompressed WAV/FLAC file passes 20 MB within a few minutes
-- of recording.
update storage.buckets
set file_size_limit = 52428800 -- 50 MB
where id = 'news-media';
