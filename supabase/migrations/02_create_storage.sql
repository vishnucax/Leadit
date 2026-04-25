-- Create a storage bucket for post images and event posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('leadit-images', 'leadit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'leadit-images' );

-- Allow public upload to the bucket (since users are anonymous, we have to allow public insert, or restrict based on something else, but public is fine for an anonymous app, we'll restrict file types in UI)
CREATE POLICY "Public Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'leadit-images' );

-- Allow admins to delete
CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'leadit-images' AND auth.role() = 'authenticated' );
