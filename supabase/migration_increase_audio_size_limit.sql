-- ============================================================================
-- Migração: aumentar o limite de tamanho do bucket de mídia das notícias
-- Execute este arquivo no SQL Editor do Supabase (projeto já existente).
-- ============================================================================

-- O limite de 20 MB (compartilhado com o bucket de imagem) era baixo demais
-- para áudio de narração: um arquivo WAV/FLAC sem compressão passa dos 20 MB
-- em poucos minutos de gravação.
update storage.buckets
set file_size_limit = 52428800 -- 50 MB
where id = 'news-media';
