-- Migration: Add invitation system fields to guests table
-- Date: 2025-08-11

-- Add new columns to guests table for invitation system
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS invitation_code VARCHAR(10) UNIQUE,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS vip_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS invitation_method VARCHAR(20) DEFAULT 'whatsapp';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guests_invitation_code ON guests(invitation_code);
CREATE INDEX IF NOT EXISTS idx_guests_phone_number ON guests(phone_number);
CREATE INDEX IF NOT EXISTS idx_guests_confirmed_at ON guests(confirmed_at);

-- Add check constraint for vip levels
ALTER TABLE guests 
ADD CONSTRAINT chk_vip_level 
CHECK (vip_level IN ('standard', 'gold', 'platinum') OR vip_level IS NULL);

-- Add check constraint for invitation methods
ALTER TABLE guests 
ADD CONSTRAINT chk_invitation_method 
CHECK (invitation_method IN ('whatsapp', 'physical', 'email') OR invitation_method IS NULL);

-- Create a function to generate unique invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS VARCHAR(10) AS $$
DECLARE
    code VARCHAR(10);
    done BOOLEAN;
BEGIN
    done := FALSE;
    WHILE NOT done LOOP
        -- Generate code in format LUX + 3 digits (e.g., LUX001, LUX002)
        code := 'LUX' || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM guests WHERE invitation_code = code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update existing guests with invitation codes (if any exist without codes)
UPDATE guests 
SET invitation_code = generate_invitation_code()
WHERE invitation_code IS NULL;

-- Create view for invitation management
CREATE OR REPLACE VIEW invitation_status AS
SELECT 
    id,
    name,
    email,
    phone_number,
    invitation_code,
    vip_level,
    CASE 
        WHEN confirmed_at IS NOT NULL THEN 'confirmed'
        WHEN invitation_sent_at IS NOT NULL THEN 'sent'
        ELSE 'pending'
    END as status,
    invitation_sent_at,
    confirmed_at,
    checked_in_at,
    created_at
FROM guests
ORDER BY created_at DESC;