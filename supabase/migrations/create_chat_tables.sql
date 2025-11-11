-- Drop existing objects if they exist (for clean reinstall)
DROP TRIGGER IF EXISTS update_conversation_on_new_message ON public.messages;
DROP FUNCTION IF EXISTS update_conversation_last_message();
DROP FUNCTION IF EXISTS mark_messages_as_read(UUID, UUID);
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Create conversations table for storing chat conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    other_user_id UUID, -- Removed foreign key constraint to allow demo users
    other_user_name TEXT NOT NULL,
    other_user_role TEXT NOT NULL CHECK (other_user_role IN ('driver', 'restaurant', 'support', 'user')),
    other_user_avatar TEXT,
    order_id TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create messages table for storing chat messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL, -- Removed foreign key constraint to allow demo users
    receiver_id UUID NOT NULL, -- Removed foreign key constraint to allow demo users
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
    content TEXT NOT NULL,
    image_url TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS conversations_status_idx ON public.conversations(status);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_is_read_idx ON public.messages(is_read);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable Realtime for messages table (for chat subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Conversations policies (Allow authenticated users to access their conversations)
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own conversations"
    ON public.conversations FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own conversations"
    ON public.conversations FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Messages policies (Allow authenticated users to access messages)
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their sent messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their sent messages"
    ON public.messages FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Function to update conversation's last message and timestamp
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message = NEW.content,
        last_message_time = NEW.created_at,
        updated_at = NEW.created_at,
        unread_count = CASE 
            WHEN user_id = NEW.receiver_id THEN unread_count + 1
            ELSE unread_count
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update conversation when new message is sent
CREATE TRIGGER update_conversation_on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conv_id UUID, user_id_param UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.messages
    SET is_read = true
    WHERE conversation_id = conv_id 
        AND receiver_id = user_id_param 
        AND is_read = false;
    
    UPDATE public.conversations
    SET unread_count = 0
    WHERE id = conv_id AND user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.conversations IS 'Stores chat conversations between users';
COMMENT ON TABLE public.messages IS 'Stores individual chat messages';
