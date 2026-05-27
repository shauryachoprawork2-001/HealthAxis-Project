-- HealthAxis Database Schema
-- V1: Initial Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    role VARCHAR(50) NOT NULL,
    profile_image_url VARCHAR(500),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    refresh_token TEXT,
    password_reset_token VARCHAR(255),
    password_reset_expiry TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);

-- Hospital Branches
CREATE TABLE hospital_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    branch_code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin_code VARCHAR(20),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    total_beds INTEGER,
    icu_beds INTEGER,
    emergency_beds INTEGER,
    logo_url VARCHAR(500),
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_doctor_name VARCHAR(255),
    contact_extension VARCHAR(20),
    hospital_branch_id UUID NOT NULL REFERENCES hospital_branches(id),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Wards
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    ward_type VARCHAR(50),
    floor_number INTEGER,
    total_beds INTEGER,
    nurse_station VARCHAR(100),
    hospital_branch_id UUID NOT NULL REFERENCES hospital_branches(id),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Bed Inventory
CREATE TABLE bed_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_number VARCHAR(50) NOT NULL UNIQUE,
    room_number VARCHAR(50),
    bed_type VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    ward_id UUID NOT NULL REFERENCES wards(id),
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_bed_status ON bed_inventory(status);
CREATE INDEX idx_bed_ward ON bed_inventory(ward_id);

-- Doctors
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    license_number VARCHAR(100) NOT NULL UNIQUE,
    specialization VARCHAR(255) NOT NULL,
    sub_specialization VARCHAR(255),
    qualification VARCHAR(500),
    years_of_experience INTEGER,
    consultation_fee DECIMAL(10,2),
    bio TEXT,
    rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    department_id UUID REFERENCES departments(id),
    hospital_branch_id UUID REFERENCES hospital_branches(id),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_doctor_specialization ON doctors(specialization);
CREATE INDEX idx_doctor_license ON doctors(license_number);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    medical_record_number VARCHAR(50) NOT NULL UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    allergies TEXT,
    chronic_conditions TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(100),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_group_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(20),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_patient_mrn ON patients(medical_record_number);

-- Doctor Schedules
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    max_patients_per_slot INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    hospital_branch_id UUID REFERENCES hospital_branches(id),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Consultation Slots
CREATE TABLE consultation_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    slot_date_time TIMESTAMP NOT NULL,
    duration_minutes INTEGER NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_slot_doctor_time ON consultation_slots(doctor_id, slot_date_time);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_number VARCHAR(50) UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    hospital_branch_id UUID REFERENCES hospital_branches(id),
    consultation_slot_id UUID REFERENCES consultation_slots(id),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    reason_for_visit TEXT,
    symptoms TEXT,
    notes TEXT,
    consultation_type VARCHAR(50) DEFAULT 'IN_PERSON',
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_appt_patient ON appointments(patient_id);
CREATE INDEX idx_appt_doctor ON appointments(doctor_id);
CREATE INDEX idx_appt_status ON appointments(status);
CREATE INDEX idx_appt_scheduled ON appointments(scheduled_at);

-- Admissions
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    bed_id UUID REFERENCES bed_inventory(id),
    admitting_doctor_id UUID REFERENCES doctors(id),
    hospital_branch_id UUID REFERENCES hospital_branches(id),
    admitted_at TIMESTAMP NOT NULL,
    discharged_at TIMESTAMP,
    admission_reason TEXT,
    diagnosis TEXT,
    treatment_summary TEXT,
    discharge_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ADMITTED',
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Emergency Requests
CREATE TABLE emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_number VARCHAR(50) UNIQUE,
    patient_name VARCHAR(255) NOT NULL,
    patient_age VARCHAR(20),
    patient_gender VARCHAR(20),
    patient_id UUID REFERENCES patients(id),
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    chief_complaint TEXT NOT NULL,
    vital_signs TEXT,
    triage_notes TEXT,
    assigned_doctor_id UUID REFERENCES doctors(id),
    assigned_bed_id UUID REFERENCES bed_inventory(id),
    hospital_branch_id UUID REFERENCES hospital_branches(id),
    triage_time TIMESTAMP,
    assigned_time TIMESTAMP,
    ambulance_number VARCHAR(50),
    ambulance_required BOOLEAN DEFAULT FALSE,
    queue_position INTEGER,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_emg_priority ON emergency_requests(priority);
CREATE INDEX idx_emg_status ON emergency_requests(status);

-- Medical Records
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID REFERENCES doctors(id),
    appointment_id UUID REFERENCES appointments(id),
    visit_date DATE,
    diagnosis TEXT,
    prescription TEXT,
    lab_results TEXT,
    imaging_results TEXT,
    treatment_plan TEXT,
    follow_up_instructions TEXT,
    attachment_url VARCHAR(500),
    record_type VARCHAR(50),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    admission_id UUID REFERENCES admissions(id),
    appointment_id UUID REFERENCES appointments(id),
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2),
    discount_amount DECIMAL(12,2),
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    due_date DATE,
    insurance_claim_number VARCHAR(100),
    insurance_covered_amount VARCHAR(100),
    stripe_payment_intent_id VARCHAR(255),
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_invoice_patient ON invoices(patient_id);
CREATE INDEX idx_invoice_status ON invoices(payment_status);

-- Billing Items
CREATE TABLE billing_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    description VARCHAR(500) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    paid_at TIMESTAMP,
    status VARCHAR(50),
    receipt_url VARCHAR(500),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Accommodations
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    distance_from_hospital_km DECIMAL(6,2),
    type VARCHAR(50),
    price_per_night DECIMAL(8,2),
    total_rooms INTEGER,
    available_rooms INTEGER,
    amenities TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    rating DECIMAL(3,2),
    image_url VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    hospital_branch_id UUID REFERENCES hospital_branches(id),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Relative Stays
CREATE TABLE relative_stays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    accommodation_id UUID NOT NULL REFERENCES accommodations(id),
    patient_id UUID REFERENCES patients(id),
    relative_first_name VARCHAR(100),
    relative_last_name VARCHAR(100),
    relative_phone VARCHAR(20),
    relative_email VARCHAR(255),
    relation_to_patient VARCHAR(100),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    status VARCHAR(50),
    total_cost DECIMAL(10,2),
    special_requests TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Transport Requests
CREATE TABLE transport_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    transport_type VARCHAR(50),
    pickup_address TEXT,
    dropoff_address TEXT,
    scheduled_time TIMESTAMP,
    status VARCHAR(50),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    vehicle_number VARCHAR(50),
    estimated_cost DECIMAL(8,2),
    is_emergency BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id UUID,
    reference_type VARCHAR(100),
    action_url VARCHAR(500),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(is_read);
