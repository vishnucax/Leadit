-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- POSTS TABLE
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'confession', 'story', 'meme', 'event')),
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  visitor_id UUID NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_admin_post BOOLEAN DEFAULT FALSE,
  score FLOAT DEFAULT 0
);

-- COMMENTS TABLE
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  visitor_id UUID NOT NULL
);

-- VOTES TABLE
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)),
  UNIQUE(post_id, visitor_id)
);

-- REPORTS TABLE
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVENTS TABLE
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  poster_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BANS TABLE
CREATE TABLE bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id UUID NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ADMINS TABLE (to link auth.users to admin status)
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_posts_visitor_id ON posts(visitor_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_score ON posts(score DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_votes_visitor_id ON votes(visitor_id);

-- TRENDING SCORE CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION calculate_score() RETURNS TRIGGER AS $$
BEGIN
  -- score = (upvotes * 2) + comment_count - (hours_since_creation * decay_factor)
  -- Simplified for now: score = (upvotes * 2) + comment_count
  NEW.score := (NEW.upvotes * 2) + NEW.comment_count;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER TO UPDATE SCORE ON POST UPDATE
CREATE TRIGGER tr_update_post_score
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION calculate_score();

-- RLS POLICIES

-- Posts: Everyone can read, anyone can create, only admins can update/delete
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public create posts" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update posts" ON posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete posts" ON posts FOR DELETE USING (auth.role() = 'authenticated');

-- Comments: Everyone can read, anyone can create, only admins can delete
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public create comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin delete comments" ON comments FOR DELETE USING (auth.role() = 'authenticated');

-- Votes: Anyone can read/create/update their own, but since anonymous, we use visitor_id check or just public for now
-- To be safe, we'll allow public insert/select/update
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public create votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update votes" ON votes FOR UPDATE USING (true);

-- Reports: Public can create, only admins can read/update
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public create reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read reports" ON reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update reports" ON reports FOR UPDATE USING (auth.role() = 'authenticated');

-- Events: Everyone can read, only admins can manage
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Admin manage events" ON events ALL USING (auth.role() = 'authenticated');

-- Bans: Only admins can read/manage
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage bans" ON bans ALL USING (auth.role() = 'authenticated');
