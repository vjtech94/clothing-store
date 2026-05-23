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
