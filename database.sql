-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Guests table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  checked_in_at TIMESTAMP,
  device_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  chapter_number INTEGER,
  date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'upcoming',
  max_capacity INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  brand VARCHAR(255),
  price DECIMAL(10,2),
  size VARCHAR(50),
  condition VARCHAR(50),
  description TEXT,
  measurements JSONB,
  images JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Looks table
CREATE TABLE looks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  look_number INTEGER,
  name VARCHAR(255),
  hero_image VARCHAR(500),
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Look_Products junction table
CREATE TABLE look_products (
  look_id UUID REFERENCES looks(id),
  product_id UUID REFERENCES products(id),
  display_order INTEGER,
  PRIMARY KEY (look_id, product_id)
);

-- Wishlists table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES guests(id),
  product_id UUID REFERENCES products(id),
  look_id UUID REFERENCES looks(id),
  wish_type VARCHAR(50),
  position INTEGER,
  added_at TIMESTAMP DEFAULT NOW(),
  event_id UUID REFERENCES events(id)
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  sent_by UUID REFERENCES guests(id)
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  guest_id UUID REFERENCES guests(id),
  action VARCHAR(50),
  product_id UUID,
  look_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create a default event for testing
INSERT INTO events (name, chapter_number, date, status)
VALUES ('Chapter I', 1, NOW() + INTERVAL '7 days', 'upcoming');
