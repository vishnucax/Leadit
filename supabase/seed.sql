-- Drop category column from posts (if it still exists)
ALTER TABLE posts DROP COLUMN IF EXISTS category;
DROP INDEX IF EXISTS idx_posts_category;

-- Update the type constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_type_check CHECK (type IN ('text', 'image', 'confession', 'story', 'meme', 'event', 'admin'));

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('leadit-images', 'leadit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts for testing
INSERT INTO posts (content, visitor_id, type, is_admin_post, upvotes, comment_count, score) VALUES
(
  '🎉 Welcome to Leadit — the anonymous discussion platform for LEAD College of Management! Post anything: confessions, memes, placement news, campus stories. No login required!',
  gen_random_uuid(), 'text', true, 42, 8, 100
),
(
  'I got placed at Infosys today!! 3 months of prep finally paid off. For anyone still prepping — LeetCode + resume projects is the winning combo. AMA!',
  gen_random_uuid(), 'text', false, 89, 24, 202
),
(
  'Hot take: the new canteen menu this semester is actually 🔥. The biryani on Fridays is unmatched. Change my mind.',
  gen_random_uuid(), 'meme', false, 56, 12, 124
),
(
  'Confession: I have been sitting in the wrong batch''s classes for 2 whole weeks and nobody noticed. The professor even calls me by a different name now 💀',
  gen_random_uuid(), 'confession', false, 134, 45, 313
),
(
  'PSA: Library WiFi is 10x faster after 9 PM. Tip from a final year student who survived 4 assignments in one night.',
  gen_random_uuid(), 'text', false, 78, 19, 175
)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, date, location) VALUES
(
  'Mock Placement Interviews',
  'Placement cell is conducting mock interviews for all final year students. Register by April 27th. Come prepared with your updated resume and formal attire.',
  NOW() + INTERVAL '3 days',
  'Seminar Hall, Block A'
),
(
  'LEAD Tech Fest 2026',
  'Annual technology festival featuring a 24-hour hackathon, project expo, industry guest lectures, and prizes worth ₹1 Lakh!',
  NOW() + INTERVAL '10 days',
  'Main Auditorium, LEAD Campus'
)
ON CONFLICT DO NOTHING;
