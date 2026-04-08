-- Create prices table
CREATE TABLE IF NOT EXISTS prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weight_from DECIMAL(10,2) NOT NULL,
  weight_to DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'сомони',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default prices
INSERT INTO prices (weight_from, weight_to, price) VALUES
  (0, 0.5, 15),
  (1, NULL, 25)
ON CONFLICT DO NOTHING;

-- Add is_admin column to users if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
