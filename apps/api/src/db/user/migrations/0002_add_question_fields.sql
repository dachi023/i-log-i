-- 質問テーブルに回答タイプ関連カラムを追加
ALTER TABLE questions ADD COLUMN answer_type TEXT NOT NULL DEFAULT 'text';
ALTER TABLE questions ADD COLUMN options TEXT;
ALTER TABLE questions ADD COLUMN scale_min INTEGER;
ALTER TABLE questions ADD COLUMN scale_max INTEGER;
ALTER TABLE questions ADD COLUMN scale_labels TEXT;
