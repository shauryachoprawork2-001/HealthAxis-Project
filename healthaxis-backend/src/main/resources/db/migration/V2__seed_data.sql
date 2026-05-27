-- V2: Seed Data for HealthAxis

-- Default Admin User (password: Admin@123)
INSERT INTO users (id, email, password, first_name, last_name, phone_number, role, enabled, account_non_locked, deleted, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@healthaxis.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewXQ5mG8RV3XBRXW',
    'System', 'Admin', '+919999999999', 'ADMIN', true, true, false, NOW(), NOW()
);

-- Hospital Branches
INSERT INTO hospital_branches (id, name, branch_code, address, city, state, country, pin_code, phone_number, email, total_beds, icu_beds, emergency_beds, active, deleted, created_at, updated_at)
VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'HealthAxis Central Hospital', 'HAX-CENTRAL', '15 Medical Drive, Sector 12', 'New Delhi', 'Delhi', 'India', '110001', '+911123456789', 'central@healthaxis.com', 500, 50, 30, true, false, NOW(), NOW()),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'HealthAxis North Campus', 'HAX-NORTH', '42 Healthcare Avenue, Block A', 'Mumbai', 'Maharashtra', 'India', '400001', '+912223456789', 'north@healthaxis.com', 350, 35, 20, true, false, NOW(), NOW()),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'HealthAxis South Wing', 'HAX-SOUTH', '8 Wellness Road, Phase 2', 'Bangalore', 'Karnataka', 'India', '560001', '+913323456789', 'south@healthaxis.com', 280, 28, 15, true, false, NOW(), NOW());

-- Departments for Central Hospital
INSERT INTO departments (id, name, description, hospital_branch_id, deleted, created_at, updated_at)
VALUES
    ('d1e2f3a4-b5c6-7890-def1-234567890abc', 'Cardiology', 'Heart and cardiovascular care', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('e2f3a4b5-c6d7-8901-ef12-34567890abcd', 'Neurology', 'Brain and nervous system disorders', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('f3a4b5c6-d7e8-9012-f123-4567890abcde', 'Orthopedics', 'Bone, joint and muscle care', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('a4b5c6d7-e8f9-0123-a234-567890abcdef', 'Pediatrics', 'Child healthcare', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('b5c6d7e8-f9a0-1234-b345-67890abcdef0', 'Emergency Medicine', 'Emergency and critical care', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('c6d7e8f9-a0b1-2345-c456-7890abcdef01', 'Oncology', 'Cancer diagnosis and treatment', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW());

-- Wards for Central Hospital
INSERT INTO wards (id, name, ward_type, floor_number, total_beds, hospital_branch_id, deleted, created_at, updated_at)
VALUES
    ('w1a2b3c4-d5e6-7890-ward-111111111111', 'General Ward A', 'GENERAL', 1, 40, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('w2a2b3c4-d5e6-7890-ward-222222222222', 'ICU Unit 1', 'ICU', 2, 20, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('w3a2b3c4-d5e6-7890-ward-333333333333', 'Cardiac Ward', 'SURGICAL', 3, 30, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('w4a2b3c4-d5e6-7890-ward-444444444444', 'Pediatric Ward', 'PEDIATRIC', 4, 25, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('w5a2b3c4-d5e6-7890-ward-555555555555', 'Emergency Ward', 'GENERAL', 0, 15, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW());

-- Sample Beds for General Ward A
INSERT INTO bed_inventory (bed_number, room_number, bed_type, status, ward_id, deleted, created_at, updated_at)
SELECT 
    'GWA-' || LPAD(n::text, 3, '0'),
    'R' || LPAD(((n-1)/2 + 1)::text, 2, '0'),
    'STANDARD',
    CASE WHEN n % 3 = 0 THEN 'OCCUPIED' ELSE 'AVAILABLE' END,
    'w1a2b3c4-d5e6-7890-ward-111111111111',
    false, NOW(), NOW()
FROM generate_series(1, 20) n;

-- Sample Beds for ICU
INSERT INTO bed_inventory (bed_number, room_number, bed_type, status, ward_id, deleted, created_at, updated_at)
SELECT
    'ICU-' || LPAD(n::text, 3, '0'),
    'ICU-R' || n::text,
    'ICU',
    CASE WHEN n % 2 = 0 THEN 'OCCUPIED' ELSE 'AVAILABLE' END,
    'w2a2b3c4-d5e6-7890-ward-222222222222',
    false, NOW(), NOW()
FROM generate_series(1, 10) n;

-- Accommodations near Central Hospital
INSERT INTO accommodations (name, address, city, latitude, longitude, distance_from_hospital_km, type, price_per_night, total_rooms, available_rooms, amenities, contact_phone, rating, active, hospital_branch_id, deleted, created_at, updated_at)
VALUES
    ('MediStay Comfort Lodge', '12 Care Street, Sector 11', 'New Delhi', 28.6139, 77.2090, 0.8, 'PRIVATE_ROOM', 1200.00, 30, 18, 'WiFi,AC,Breakfast,Laundry', '+911198765432', 4.2, true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('Healing Haven Guest House', '5 Wellness Lane', 'New Delhi', 28.6150, 77.2100, 1.2, 'SHARED_ROOM', 650.00, 20, 12, 'WiFi,Meals,TV', '+911198765433', 3.9, true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('CarersNest Family Suite', '20 Hope Avenue, Sector 13', 'New Delhi', 28.6120, 77.2080, 0.5, 'FAMILY_SUITE', 2500.00, 10, 4, 'WiFi,AC,Kitchen,TV,Parking', '+911198765434', 4.7, true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW()),
    ('Budget MediRooms', '3 Economy Row', 'New Delhi', 28.6160, 77.2110, 1.5, 'BUDGET', 400.00, 40, 25, 'WiFi,Shared Bath', '+911198765435', 3.5, true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', false, NOW(), NOW());

