-- Clothing Store - Database Initialization Script
-- Creates all schemas and tables for the microservices

-- ============ AUTH SCHEMA ============
CREATE SCHEMA IF NOT EXISTS auth_schema;

CREATE TABLE auth_schema.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_schema.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_schema.users(id) ON DELETE CASCADE,
    label VARCHAR(50),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth_schema.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_schema.users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON auth_schema.users(email);
CREATE INDEX idx_addresses_user ON auth_schema.addresses(user_id);
CREATE INDEX idx_refresh_tokens_token ON auth_schema.refresh_tokens(token);

-- ============ PRODUCT SCHEMA ============
CREATE SCHEMA IF NOT EXISTS product_schema;

CREATE TABLE product_schema.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    parent_id UUID REFERENCES product_schema.categories(id),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_schema.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    category_id UUID REFERENCES product_schema.categories(id),
    brand VARCHAR(100),
    material VARCHAR(100),
    gender VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_schema.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES product_schema.products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT false
);

CREATE TABLE product_schema.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES product_schema.products(id) ON DELETE CASCADE,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    color_hex VARCHAR(7),
    sku VARCHAR(50) UNIQUE NOT NULL,
    stock_quantity INT DEFAULT 0,
    price_override DECIMAL(10,2),
    UNIQUE(product_id, size, color)
);

ALTER TABLE product_schema.products ADD COLUMN search_vector tsvector;

CREATE INDEX idx_products_category ON product_schema.products(category_id);
CREATE INDEX idx_products_price ON product_schema.products(base_price);
CREATE INDEX idx_products_active ON product_schema.products(is_active);
CREATE INDEX idx_products_search ON product_schema.products USING GIN(search_vector);
CREATE INDEX idx_variants_product ON product_schema.product_variants(product_id);
CREATE INDEX idx_variants_stock ON product_schema.product_variants(stock_quantity);
CREATE INDEX idx_images_product ON product_schema.product_images(product_id);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION product_schema.update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.brand, '') || ' ' || COALESCE(NEW.material, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_search_vector
    BEFORE INSERT OR UPDATE ON product_schema.products
    FOR EACH ROW EXECUTE FUNCTION product_schema.update_search_vector();

-- ============ CART SCHEMA ============
CREATE SCHEMA IF NOT EXISTS cart_schema;

CREATE TABLE cart_schema.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_schema.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES cart_schema.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cart_id, variant_id)
);

CREATE INDEX idx_carts_user ON cart_schema.carts(user_id);
CREATE INDEX idx_cart_items_cart ON cart_schema.cart_items(cart_id);

-- ============ ORDER SCHEMA ============
CREATE SCHEMA IF NOT EXISTS order_schema;

CREATE TABLE order_schema.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_intent_id VARCHAR(255),
    payment_method VARCHAR(50),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_schema.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES order_schema.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500)
);

CREATE TABLE order_schema.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES order_schema.orders(id),
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(30) NOT NULL,
    stripe_response JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON order_schema.orders(user_id);
CREATE INDEX idx_orders_status ON order_schema.orders(status);
CREATE INDEX idx_orders_number ON order_schema.orders(order_number);
CREATE INDEX idx_order_items_order ON order_schema.order_items(order_id);
CREATE INDEX idx_payments_order ON order_schema.payments(order_id);

-- ============ SEED ADMIN USER ============
-- Password: Admin@123 (BCrypt hash)
INSERT INTO auth_schema.users (email, password_hash, first_name, last_name, role)
VALUES ('admin@clothingstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- ============ SEED CATEGORIES ============
INSERT INTO product_schema.categories (id, name, slug, description, sort_order) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'Men', 'men', 'Men''s clothing and accessories', 1),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'Women', 'women', 'Women''s clothing and accessories', 2),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'Kids', 'kids', 'Kids'' clothing', 3),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'Accessories', 'accessories', 'Bags, belts, hats and more', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============ SEED PRODUCTS ============
INSERT INTO product_schema.products (id, name, slug, description, base_price, sale_price, category_id, brand, material, gender) VALUES
    ('b1000001-0000-0000-0000-000000000001', 'Classic Cotton T-Shirt', 'classic-cotton-tshirt', 'Comfortable everyday cotton t-shirt with a relaxed fit', 999.00, 799.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'StoreBasics', 'Cotton', 'MALE'),
    ('b1000001-0000-0000-0000-000000000002', 'Slim Fit Denim Jeans', 'slim-fit-denim-jeans', 'Modern slim fit jeans with stretch comfort', 2499.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'DenimCo', 'Denim', 'MALE'),
    ('b1000001-0000-0000-0000-000000000003', 'Casual Linen Shirt', 'casual-linen-shirt', 'Breathable linen shirt perfect for summer', 1899.00, 1499.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'StoreBasics', 'Linen', 'MALE'),
    ('b1000001-0000-0000-0000-000000000004', 'Hooded Sweatshirt', 'hooded-sweatshirt', 'Warm and cozy hoodie for casual wear', 1799.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'ComfortWear', 'Cotton Blend', 'MALE'),
    ('b1000001-0000-0000-0000-000000000005', 'Chino Shorts', 'chino-shorts', 'Versatile chino shorts for warm weather', 1299.00, 999.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'StoreBasics', 'Cotton', 'MALE'),
    ('b1000001-0000-0000-0000-000000000006', 'Floral Summer Dress', 'floral-summer-dress', 'Light and breezy floral print dress', 2299.00, 1899.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'FloraStyle', 'Polyester', 'FEMALE'),
    ('b1000001-0000-0000-0000-000000000007', 'High Waist Skinny Jeans', 'high-waist-skinny-jeans', 'Flattering high waist jeans with stretch', 2699.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'DenimCo', 'Denim', 'FEMALE'),
    ('b1000001-0000-0000-0000-000000000008', 'Oversized Crop Top', 'oversized-crop-top', 'Trendy oversized crop top in solid colors', 899.00, 699.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'TrendSet', 'Cotton', 'FEMALE'),
    ('b1000001-0000-0000-0000-000000000009', 'Pleated Midi Skirt', 'pleated-midi-skirt', 'Elegant pleated skirt for any occasion', 1599.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'FloraStyle', 'Polyester', 'FEMALE'),
    ('b1000001-0000-0000-0000-000000000010', 'Wrap Blouse', 'wrap-blouse', 'Sophisticated wrap-style blouse for office or casual', 1399.00, 1099.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'StoreBasics', 'Silk Blend', 'FEMALE'),
    ('b1000001-0000-0000-0000-000000000011', 'Leather Bomber Jacket', 'leather-bomber-jacket', 'Premium faux leather bomber jacket', 4999.00, 3999.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'UrbanEdge', 'Faux Leather', 'MALE'),
    ('b1000001-0000-0000-0000-000000000012', 'Printed Kurti', 'printed-kurti', 'Beautiful block-printed cotton kurti', 1299.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'EthnicVibe', 'Cotton', 'FEMALE'),
    ('b1000001-0000-0000-0000-000000000013', 'Kids Graphic Tee', 'kids-graphic-tee', 'Fun graphic print t-shirt for children', 599.00, 449.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'KidZone', 'Cotton', 'UNISEX'),
    ('b1000001-0000-0000-0000-000000000014', 'Kids Cargo Pants', 'kids-cargo-pants', 'Durable cargo pants with multiple pockets', 999.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'KidZone', 'Cotton', 'UNISEX'),
    ('b1000001-0000-0000-0000-000000000015', 'Kids Party Dress', 'kids-party-dress', 'Adorable party dress with tulle skirt', 1499.00, 1199.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'LittleStar', 'Polyester', 'FEMALE'),
    ('b1000001-0000-0000-0000-000000000016', 'Canvas Tote Bag', 'canvas-tote-bag', 'Spacious canvas tote for everyday use', 799.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'CarryAll', 'Canvas', 'UNISEX'),
    ('b1000001-0000-0000-0000-000000000017', 'Leather Belt', 'leather-belt', 'Classic genuine leather belt with buckle', 699.00, 549.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'LeatherCraft', 'Genuine Leather', 'MALE'),
    ('b1000001-0000-0000-0000-000000000018', 'Wool Beanie', 'wool-beanie', 'Warm knitted wool beanie for winter', 499.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'WinterWear', 'Wool', 'UNISEX'),
    ('b1000001-0000-0000-0000-000000000019', 'Polo T-Shirt', 'polo-tshirt', 'Classic polo with embroidered logo', 1499.00, 1199.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'StoreBasics', 'Pique Cotton', 'MALE'),
    ('b1000001-0000-0000-0000-000000000020', 'Yoga Leggings', 'yoga-leggings', 'High-performance yoga leggings with pocket', 1799.00, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'ActiveFit', 'Spandex Blend', 'FEMALE')
ON CONFLICT (slug) DO NOTHING;

-- ============ SEED PRODUCT VARIANTS ============
INSERT INTO product_schema.product_variants (product_id, size, color, color_hex, sku, stock_quantity) VALUES
    ('b1000001-0000-0000-0000-000000000001', 'S', 'White', '#FFFFFF', 'CT-WHT-S', 50),
    ('b1000001-0000-0000-0000-000000000001', 'M', 'White', '#FFFFFF', 'CT-WHT-M', 80),
    ('b1000001-0000-0000-0000-000000000001', 'L', 'White', '#FFFFFF', 'CT-WHT-L', 60),
    ('b1000001-0000-0000-0000-000000000001', 'M', 'Black', '#000000', 'CT-BLK-M', 70),
    ('b1000001-0000-0000-0000-000000000001', 'L', 'Black', '#000000', 'CT-BLK-L', 55),
    ('b1000001-0000-0000-0000-000000000001', 'M', 'Navy', '#001F3F', 'CT-NVY-M', 45),
    ('b1000001-0000-0000-0000-000000000002', '30', 'Blue', '#0074D9', 'SJ-BLU-30', 30),
    ('b1000001-0000-0000-0000-000000000002', '32', 'Blue', '#0074D9', 'SJ-BLU-32', 50),
    ('b1000001-0000-0000-0000-000000000002', '34', 'Blue', '#0074D9', 'SJ-BLU-34', 40),
    ('b1000001-0000-0000-0000-000000000002', '32', 'Black', '#000000', 'SJ-BLK-32', 35),
    ('b1000001-0000-0000-0000-000000000003', 'M', 'White', '#FFFFFF', 'LS-WHT-M', 25),
    ('b1000001-0000-0000-0000-000000000003', 'L', 'White', '#FFFFFF', 'LS-WHT-L', 20),
    ('b1000001-0000-0000-0000-000000000003', 'M', 'Sky Blue', '#87CEEB', 'LS-SKY-M', 30),
    ('b1000001-0000-0000-0000-000000000004', 'M', 'Grey', '#808080', 'HS-GRY-M', 40),
    ('b1000001-0000-0000-0000-000000000004', 'L', 'Grey', '#808080', 'HS-GRY-L', 35),
    ('b1000001-0000-0000-0000-000000000004', 'XL', 'Black', '#000000', 'HS-BLK-XL', 25),
    ('b1000001-0000-0000-0000-000000000005', '30', 'Khaki', '#C3B091', 'CS-KHK-30', 40),
    ('b1000001-0000-0000-0000-000000000005', '32', 'Khaki', '#C3B091', 'CS-KHK-32', 45),
    ('b1000001-0000-0000-0000-000000000005', '32', 'Navy', '#001F3F', 'CS-NVY-32', 30),
    ('b1000001-0000-0000-0000-000000000006', 'S', 'Floral Pink', '#FFB6C1', 'FD-PNK-S', 20),
    ('b1000001-0000-0000-0000-000000000006', 'M', 'Floral Pink', '#FFB6C1', 'FD-PNK-M', 30),
    ('b1000001-0000-0000-0000-000000000006', 'L', 'Floral Blue', '#6495ED', 'FD-BLU-L', 15),
    ('b1000001-0000-0000-0000-000000000007', '26', 'Dark Blue', '#00008B', 'HW-DBL-26', 25),
    ('b1000001-0000-0000-0000-000000000007', '28', 'Dark Blue', '#00008B', 'HW-DBL-28', 40),
    ('b1000001-0000-0000-0000-000000000007', '30', 'Black', '#000000', 'HW-BLK-30', 35),
    ('b1000001-0000-0000-0000-000000000008', 'S', 'White', '#FFFFFF', 'OC-WHT-S', 50),
    ('b1000001-0000-0000-0000-000000000008', 'M', 'White', '#FFFFFF', 'OC-WHT-M', 60),
    ('b1000001-0000-0000-0000-000000000008', 'M', 'Pink', '#FFC0CB', 'OC-PNK-M', 40),
    ('b1000001-0000-0000-0000-000000000009', 'S', 'Beige', '#F5F5DC', 'PS-BGE-S', 20),
    ('b1000001-0000-0000-0000-000000000009', 'M', 'Beige', '#F5F5DC', 'PS-BGE-M', 25),
    ('b1000001-0000-0000-0000-000000000009', 'M', 'Black', '#000000', 'PS-BLK-M', 30),
    ('b1000001-0000-0000-0000-000000000010', 'S', 'Cream', '#FFFDD0', 'WB-CRM-S', 15),
    ('b1000001-0000-0000-0000-000000000010', 'M', 'Cream', '#FFFDD0', 'WB-CRM-M', 20),
    ('b1000001-0000-0000-0000-000000000011', 'M', 'Black', '#000000', 'LB-BLK-M', 10),
    ('b1000001-0000-0000-0000-000000000011', 'L', 'Black', '#000000', 'LB-BLK-L', 12),
    ('b1000001-0000-0000-0000-000000000011', 'L', 'Brown', '#8B4513', 'LB-BRN-L', 8),
    ('b1000001-0000-0000-0000-000000000012', 'S', 'Blue Print', '#4169E1', 'PK-BLU-S', 25),
    ('b1000001-0000-0000-0000-000000000012', 'M', 'Blue Print', '#4169E1', 'PK-BLU-M', 35),
    ('b1000001-0000-0000-0000-000000000012', 'L', 'Red Print', '#DC143C', 'PK-RED-L', 20),
    ('b1000001-0000-0000-0000-000000000013', '4-5Y', 'Blue', '#0074D9', 'KG-BLU-4', 40),
    ('b1000001-0000-0000-0000-000000000013', '6-7Y', 'Blue', '#0074D9', 'KG-BLU-6', 50),
    ('b1000001-0000-0000-0000-000000000013', '6-7Y', 'Red', '#FF0000', 'KG-RED-6', 35),
    ('b1000001-0000-0000-0000-000000000014', '4-5Y', 'Olive', '#808000', 'KC-OLV-4', 30),
    ('b1000001-0000-0000-0000-000000000014', '6-7Y', 'Olive', '#808000', 'KC-OLV-6', 35),
    ('b1000001-0000-0000-0000-000000000014', '8-9Y', 'Khaki', '#C3B091', 'KC-KHK-8', 25),
    ('b1000001-0000-0000-0000-000000000015', '4-5Y', 'Pink', '#FFC0CB', 'KD-PNK-4', 20),
    ('b1000001-0000-0000-0000-000000000015', '6-7Y', 'Pink', '#FFC0CB', 'KD-PNK-6', 25),
    ('b1000001-0000-0000-0000-000000000016', 'ONE', 'Natural', '#FAEBD7', 'TB-NAT-1', 60),
    ('b1000001-0000-0000-0000-000000000016', 'ONE', 'Black', '#000000', 'TB-BLK-1', 45),
    ('b1000001-0000-0000-0000-000000000017', '32', 'Brown', '#8B4513', 'LB-BRN-32', 30),
    ('b1000001-0000-0000-0000-000000000017', '34', 'Brown', '#8B4513', 'LB-BRN-34', 35),
    ('b1000001-0000-0000-0000-000000000017', '34', 'Black', '#000000', 'LBT-BLK-34', 25),
    ('b1000001-0000-0000-0000-000000000018', 'ONE', 'Charcoal', '#36454F', 'WB-CHR-1', 50),
    ('b1000001-0000-0000-0000-000000000018', 'ONE', 'Burgundy', '#800020', 'WB-BRG-1', 40),
    ('b1000001-0000-0000-0000-000000000019', 'M', 'Navy', '#001F3F', 'PT-NVY-M', 45),
    ('b1000001-0000-0000-0000-000000000019', 'L', 'Navy', '#001F3F', 'PT-NVY-L', 35),
    ('b1000001-0000-0000-0000-000000000019', 'L', 'White', '#FFFFFF', 'PT-WHT-L', 30),
    ('b1000001-0000-0000-0000-000000000020', 'S', 'Black', '#000000', 'YL-BLK-S', 35),
    ('b1000001-0000-0000-0000-000000000020', 'M', 'Black', '#000000', 'YL-BLK-M', 50),
    ('b1000001-0000-0000-0000-000000000020', 'M', 'Grey', '#808080', 'YL-GRY-M', 30)
ON CONFLICT (sku) DO NOTHING;

-- ============ SEED PRODUCT IMAGES (placeholder URLs) ============
INSERT INTO product_schema.product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
    ('b1000001-0000-0000-0000-000000000001', 'https://placehold.co/600x800/FFFFFF/000000?text=Cotton+Tee', 'Classic Cotton T-Shirt', 0, true),
    ('b1000001-0000-0000-0000-000000000002', 'https://placehold.co/600x800/0074D9/FFFFFF?text=Slim+Jeans', 'Slim Fit Denim Jeans', 0, true),
    ('b1000001-0000-0000-0000-000000000003', 'https://placehold.co/600x800/87CEEB/000000?text=Linen+Shirt', 'Casual Linen Shirt', 0, true),
    ('b1000001-0000-0000-0000-000000000004', 'https://placehold.co/600x800/808080/FFFFFF?text=Hoodie', 'Hooded Sweatshirt', 0, true),
    ('b1000001-0000-0000-0000-000000000005', 'https://placehold.co/600x800/C3B091/000000?text=Chino+Shorts', 'Chino Shorts', 0, true),
    ('b1000001-0000-0000-0000-000000000006', 'https://placehold.co/600x800/FFB6C1/000000?text=Floral+Dress', 'Floral Summer Dress', 0, true),
    ('b1000001-0000-0000-0000-000000000007', 'https://placehold.co/600x800/00008B/FFFFFF?text=Skinny+Jeans', 'High Waist Skinny Jeans', 0, true),
    ('b1000001-0000-0000-0000-000000000008', 'https://placehold.co/600x800/FFFFFF/000000?text=Crop+Top', 'Oversized Crop Top', 0, true),
    ('b1000001-0000-0000-0000-000000000009', 'https://placehold.co/600x800/F5F5DC/000000?text=Midi+Skirt', 'Pleated Midi Skirt', 0, true),
    ('b1000001-0000-0000-0000-000000000010', 'https://placehold.co/600x800/FFFDD0/000000?text=Wrap+Blouse', 'Wrap Blouse', 0, true),
    ('b1000001-0000-0000-0000-000000000011', 'https://placehold.co/600x800/000000/FFFFFF?text=Bomber+Jacket', 'Leather Bomber Jacket', 0, true),
    ('b1000001-0000-0000-0000-000000000012', 'https://placehold.co/600x800/4169E1/FFFFFF?text=Printed+Kurti', 'Printed Kurti', 0, true),
    ('b1000001-0000-0000-0000-000000000013', 'https://placehold.co/600x800/0074D9/FFFFFF?text=Kids+Tee', 'Kids Graphic Tee', 0, true),
    ('b1000001-0000-0000-0000-000000000014', 'https://placehold.co/600x800/808000/FFFFFF?text=Kids+Cargo', 'Kids Cargo Pants', 0, true),
    ('b1000001-0000-0000-0000-000000000015', 'https://placehold.co/600x800/FFC0CB/000000?text=Party+Dress', 'Kids Party Dress', 0, true),
    ('b1000001-0000-0000-0000-000000000016', 'https://placehold.co/600x800/FAEBD7/000000?text=Tote+Bag', 'Canvas Tote Bag', 0, true),
    ('b1000001-0000-0000-0000-000000000017', 'https://placehold.co/600x800/8B4513/FFFFFF?text=Leather+Belt', 'Leather Belt', 0, true),
    ('b1000001-0000-0000-0000-000000000018', 'https://placehold.co/600x800/36454F/FFFFFF?text=Wool+Beanie', 'Wool Beanie', 0, true),
    ('b1000001-0000-0000-0000-000000000019', 'https://placehold.co/600x800/001F3F/FFFFFF?text=Polo+Shirt', 'Polo T-Shirt', 0, true),
    ('b1000001-0000-0000-0000-000000000020', 'https://placehold.co/600x800/000000/FFFFFF?text=Yoga+Leggings', 'Yoga Leggings', 0, true)
ON CONFLICT DO NOTHING;
