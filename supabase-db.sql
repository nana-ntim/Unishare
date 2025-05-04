-- UniShare Database Schema - Simplified Version
-- For quick implementation with Supabase

-- Required extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

------------------------------------------------
-- CORE TABLES
------------------------------------------------

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 30),
  full_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  university TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Username validation
  CONSTRAINT valid_username CHECK (username ~* '^[a-zA-Z0-9._]+$')
);

-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Likes table
CREATE TABLE public.likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

-- Follows table
CREATE TABLE public.follows (
  follower_id UUID REFERENCES public.profiles(id) NOT NULL,
  following_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Hashtags table
CREATE TABLE public.hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  posts_count INTEGER DEFAULT 0
);

-- Post hashtags junction table
CREATE TABLE public.post_hashtags (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  hashtag_id UUID REFERENCES public.hashtags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, hashtag_id)
);

-- Bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

------------------------------------------------
-- INDEXES
------------------------------------------------

-- Profile indexes
CREATE INDEX profiles_username_search_idx ON public.profiles USING gin (username gin_trgm_ops);
CREATE INDEX profiles_university_idx ON public.profiles (university);

-- Post indexes
CREATE INDEX posts_user_id_created_at_idx ON public.posts (user_id, created_at DESC);
CREATE INDEX posts_created_at_idx ON public.posts (created_at DESC);

-- Comment indexes
CREATE INDEX comments_post_id_created_at_idx ON public.comments (post_id, created_at DESC);
CREATE INDEX comments_user_id_idx ON public.comments (user_id);

-- Like indexes
CREATE INDEX likes_user_id_idx ON public.likes (user_id);

-- Follow indexes
CREATE INDEX follows_follower_id_idx ON public.follows (follower_id);
CREATE INDEX follows_following_id_idx ON public.follows (following_id);

-- Hashtag indexes
CREATE INDEX hashtags_name_idx ON public.hashtags USING gin (name gin_trgm_ops);
CREATE INDEX post_hashtags_hashtag_id_idx ON public.post_hashtags (hashtag_id);

-- Bookmark indexes
CREATE INDEX bookmarks_user_id_created_at_idx ON public.bookmarks (user_id, created_at DESC);

------------------------------------------------
-- VIEWS
------------------------------------------------

-- Post details view
CREATE VIEW public.post_details WITH (security_barrier = true) AS
SELECT
  p.id,
  p.caption,
  p.image_url,
  p.location,
  p.created_at,
  p.updated_at,
  p.likes_count,
  p.comments_count,
  prof.id as user_id,
  prof.username,
  prof.full_name,
  prof.avatar_url,
  prof.university,
  (
    SELECT array_agg(h.name) 
    FROM public.post_hashtags ph 
    JOIN public.hashtags h ON ph.hashtag_id = h.id
    WHERE ph.post_id = p.id
  ) as hashtags
FROM
  public.posts p
JOIN
  public.profiles prof ON p.user_id = prof.id;

-- Trending hashtags view
CREATE VIEW public.trending_hashtags WITH (security_barrier = true) AS
SELECT
  h.id,
  h.name,
  COUNT(ph.post_id) AS post_count,
  prof.university
FROM
  public.hashtags h
JOIN
  public.post_hashtags ph ON h.id = ph.hashtag_id
JOIN
  public.posts p ON ph.post_id = p.id
JOIN
  public.profiles prof ON p.user_id = prof.id
WHERE
  p.created_at > NOW() - INTERVAL '7 days'
GROUP BY
  h.id, h.name, prof.university
ORDER BY
  post_count DESC;

-- User bookmarked posts view
CREATE VIEW public.user_bookmarked_posts WITH (security_barrier = true) AS
SELECT 
  b.id AS bookmark_id,
  b.user_id,
  b.post_id,
  b.created_at AS bookmarked_at,
  p.image_url,
  p.caption,
  p.location,
  p.created_at AS post_created_at,
  pr.username,
  pr.avatar_url
FROM bookmarks b
JOIN posts p ON b.post_id = p.id
JOIN profiles pr ON p.user_id = pr.id;

------------------------------------------------
-- FUNCTIONS & TRIGGERS
------------------------------------------------

-- Function to create a profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, university)
  VALUES (
    NEW.id, 
    'user' || floor(random() * 10000000)::text, -- Temporary random username
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE(NEW.raw_user_meta_data->>'university', NULL)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to process hashtags in post captions
CREATE OR REPLACE FUNCTION public.process_post_hashtags()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hashtag TEXT;
  hashtag_id UUID;
BEGIN
  -- Delete existing hashtag connections for this post
  DELETE FROM public.post_hashtags WHERE post_id = NEW.id;
  
  -- Only process if there's a caption
  IF NEW.caption IS NOT NULL THEN
    -- Find all hashtags in the caption
    FOR hashtag IN
      SELECT DISTINCT SUBSTRING(word FROM 2)
      FROM regexp_matches(NEW.caption, '#([A-Za-z0-9_]+)', 'g') AS word
    LOOP
      -- Get hashtag ID or create new hashtag
      INSERT INTO public.hashtags (name)
      VALUES (hashtag)
      ON CONFLICT (name) DO
        UPDATE SET name = hashtag
      RETURNING id INTO hashtag_id;
      
      -- Connect hashtag to post
      INSERT INTO public.post_hashtags (post_id, hashtag_id)
      VALUES (NEW.id, hashtag_id);
      
      -- Update hashtag posts count
      UPDATE public.hashtags 
      SET posts_count = posts_count + 1 
      WHERE id = hashtag_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hashtag processing
CREATE TRIGGER process_post_hashtags_trigger
  AFTER INSERT OR UPDATE OF caption ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.process_post_hashtags();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for comment counts
CREATE TRIGGER after_comment_insert
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER after_comment_delete
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- Function to update like counts
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for like counts
CREATE TRIGGER after_like_insert
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER after_like_delete
  AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

------------------------------------------------
-- SECURITY POLICIES
------------------------------------------------

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Allow users to read all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profiles" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Allow users to read all posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Allow users to create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Allow users to read all comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Allow users to create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Allow users to read all likes" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Allow users to create likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Allow users to read all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Allow users to create follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Allow users to delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Hashtags policies
CREATE POLICY "Allow users to read all hashtags" ON public.hashtags
  FOR SELECT USING (true);

CREATE POLICY "Allow users to read all post_hashtags" ON public.post_hashtags
  FOR SELECT USING (true);

-- Bookmarks policies
CREATE POLICY "Allow users to create their own bookmarks" ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own bookmarks" ON bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to read all bookmarks" ON bookmarks
  FOR SELECT
  TO authenticated
  USING (true);

-- Collections table for organizing bookmarks
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Junction table to link bookmarks to collections
CREATE TABLE public.collection_bookmarks (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  bookmark_id UUID REFERENCES public.bookmarks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (collection_id, bookmark_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  type TEXT NOT NULL, -- 'like', 'comment', 'follow', 'mention', 'system'
  entity_type TEXT, -- 'post', 'comment', 'profile', null for system
  entity_id UUID,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX collections_user_id_idx ON public.collections (user_id);
CREATE INDEX collection_bookmarks_collection_id_idx ON public.collection_bookmarks (collection_id);
CREATE INDEX collection_bookmarks_bookmark_id_idx ON public.collection_bookmarks (bookmark_id);
CREATE INDEX notifications_user_id_created_at_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_id_read_idx ON public.notifications (user_id, read);

-- Add RLS policies
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Users can view their own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- Collection bookmarks policies
CREATE POLICY "Users can view their own collection bookmarks" ON public.collection_bookmarks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections c 
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );
  
CREATE POLICY "Users can add bookmarks to their collections" ON public.collection_bookmarks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections c 
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );
  
CREATE POLICY "Users can remove bookmarks from their collections" ON public.collection_bookmarks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.collections c 
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS process_post_hashtags_trigger ON posts;

-- Drop the existing function
DROP FUNCTION IF EXISTS process_post_hashtags();

-- Create the corrected function
CREATE OR REPLACE FUNCTION process_post_hashtags()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hashtag TEXT;
  hashtag_id UUID;
  match_record RECORD;
BEGIN
  -- Delete existing hashtag connections for this post
  DELETE FROM post_hashtags WHERE post_id = NEW.id;
  
  -- Only process if there's a caption
  IF NEW.caption IS NOT NULL THEN
    -- Find all hashtags in the caption
    FOR match_record IN
      SELECT * FROM regexp_matches(NEW.caption, '#([A-Za-z0-9_]+)', 'g') 
    LOOP
      -- Get the hashtag text from the first array element
      hashtag := match_record[1];
      
      -- Get hashtag ID or create new hashtag
      INSERT INTO hashtags (name)
      VALUES (hashtag)
      ON CONFLICT (name) DO
        UPDATE SET name = hashtag
      RETURNING id INTO hashtag_id;
      
      -- Connect hashtag to post
      INSERT INTO post_hashtags (post_id, hashtag_id)
      VALUES (NEW.id, hashtag_id);
      
      -- Update hashtag posts count
      UPDATE hashtags 
      SET posts_count = posts_count + 1 
      WHERE id = hashtag_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hashtag processing
CREATE TRIGGER process_post_hashtags_trigger
  AFTER INSERT OR UPDATE OF caption ON posts
  FOR EACH ROW EXECUTE FUNCTION process_post_hashtags();

-- Run this in your Supabase SQL Editor to create notification triggers

-- First, check if notifications table exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
        -- Create notifications table
        CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
            type VARCHAR(50) NOT NULL,
            entity_type VARCHAR(50) NOT NULL,
            entity_id UUID,
            data JSONB DEFAULT '{}'::jsonb,
            message TEXT,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Add RLS policies for notifications
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow users to read their own notifications
        CREATE POLICY "Users can read their own notifications" 
        ON public.notifications FOR SELECT 
        USING (auth.uid() = user_id);
        
        -- Create policy to allow users to update their own notifications (for marking as read)
        CREATE POLICY "Users can update their own notifications" 
        ON public.notifications FOR UPDATE 
        USING (auth.uid() = user_id);
        
        -- Create policy for service role to insert notifications
        CREATE POLICY "Service role can insert notifications" 
        ON public.notifications FOR INSERT 
        WITH CHECK (true);
    END IF;
END
$$;

-- Create trigger for like notifications
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    username_val TEXT;
BEGIN
    -- First find the owner of the post
    SELECT user_id INTO post_owner_id
    FROM posts
    WHERE id = NEW.post_id;
    
    -- Skip if the post owner is liking their own post
    IF post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Get the username of the person who liked
    SELECT username INTO username_val
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Create the notification
    INSERT INTO notifications (
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        data,
        read,
        created_at
    ) VALUES (
        post_owner_id,
        NEW.user_id,
        'like',
        'post',
        NEW.post_id,
        jsonb_build_object(
            'username', username_val,
            'post_id', NEW.post_id
        ),
        false,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't block the like operation
        RAISE NOTICE 'Error creating like notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists already to avoid errors
DROP TRIGGER IF EXISTS after_insert_like ON likes;

-- Create the trigger
CREATE TRIGGER after_insert_like
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_like_notification();

-- Create trigger for comment notifications
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    username_val TEXT;
BEGIN
    -- First find the owner of the post
    SELECT user_id INTO post_owner_id
    FROM posts
    WHERE id = NEW.post_id;
    
    -- Skip if the post owner is commenting on their own post
    IF post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;
    
    -- Get the username of the commenter
    SELECT username INTO username_val
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Create the notification
    INSERT INTO notifications (
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        data,
        read,
        created_at
    ) VALUES (
        post_owner_id,
        NEW.user_id,
        'comment',
        'post',
        NEW.post_id,
        jsonb_build_object(
            'username', username_val,
            'post_id', NEW.post_id,
            'comment_id', NEW.id,
            'content', substring(NEW.content from 1 for 100)
        ),
        false,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't block the comment operation
        RAISE NOTICE 'Error creating comment notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists already to avoid errors
DROP TRIGGER IF EXISTS after_insert_comment ON comments;

-- Create the trigger
CREATE TRIGGER after_insert_comment
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION create_comment_notification();

-- Create trigger for follow notifications
CREATE OR REPLACE FUNCTION create_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
    username_val TEXT;
BEGIN
    -- Skip if someone is following themselves (shouldn't happen but just in case)
    IF NEW.follower_id = NEW.following_id THEN
        RETURN NEW;
    END IF;
    
    -- Get the username of the follower
    SELECT username INTO username_val
    FROM profiles
    WHERE id = NEW.follower_id;
    
    -- Create the notification
    INSERT INTO notifications (
        user_id,
        actor_id,
        type,
        entity_type,
        entity_id,
        data,
        read,
        created_at
    ) VALUES (
        NEW.following_id,
        NEW.follower_id,
        'follow',
        'profile',
        NEW.following_id,
        jsonb_build_object(
            'username', username_val
        ),
        false,
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't block the follow operation
        RAISE NOTICE 'Error creating follow notification: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists already to avoid errors
DROP TRIGGER IF EXISTS after_insert_follow ON follows;

-- Create the trigger
CREATE TRIGGER after_insert_follow
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION create_follow_notification();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);