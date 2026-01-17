-- GoCardless Subscription Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Update existing subscriptions table or create new one
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- GoCardless IDs
  gocardless_customer_id TEXT,
  gocardless_mandate_id TEXT,
  gocardless_subscription_id TEXT,

  -- Subscription details
  subscription_status TEXT NOT NULL DEFAULT 'pending' CHECK (subscription_status IN ('active', 'pending', 'cancelled', 'expired', 'past_due')),
  plan TEXT NOT NULL DEFAULT 'free',
  amount_in_pence INTEGER,
  currency TEXT DEFAULT 'GBP',

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_gocardless_subscription_id ON subscriptions(gocardless_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(subscription_status);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription
CREATE POLICY "Users can create own subscription"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update (for webhooks)
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
