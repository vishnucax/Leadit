-- 1. Drop category column from posts
ALTER TABLE posts DROP COLUMN IF EXISTS category;
DROP INDEX IF EXISTS idx_posts_category;

-- 2. Update the type constraint to add more if needed
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (type IN ('text', 'image', 'confession', 'story', 'meme', 'event', 'admin'));

-- 3. Create a storage bucket for post images and event posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('leadit-images', 'leadit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'leadit-images' );

-- Allow public upload to the bucket
CREATE POLICY "Public Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'leadit-images' );

-- Allow admins to delete
CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'leadit-images' AND auth.role() = 'authenticated' );
