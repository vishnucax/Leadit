-- Drop category column from posts
ALTER TABLE posts DROP COLUMN IF EXISTS category;

-- Drop the index on category if it exists
DROP INDEX IF EXISTS idx_posts_category;

-- Update the type constraint to add more if needed
-- We already have 'text', 'image', 'confession', 'story', 'meme', 'event'
-- We can add 'admin' just in case, though is_admin_post covers it.
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (type IN ('text', 'image', 'confession', 'story', 'meme', 'event', 'admin'));
