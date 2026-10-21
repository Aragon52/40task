-- ============================================================================
-- WALMARK / WALMART COPILOT PLATFORM - COMPLETE SUPABASE CLONE SCHEMA
-- ============================================================================
-- Execute this entire script in your new Supabase Project > SQL Editor.
-- It provisions all database tables, extensions, real-time publications,
-- storage buckets, RLS policies, and Auth RPC helper functions.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Enumerated Types & Role Management
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END;
$$;

-- Table: public.user_roles (Links auth.users to application roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey' AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE ONLY public.user_roles
      ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- Helper Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'::public.app_role
  )
$$;

-- Helper Function: is_owner
CREATE OR REPLACE FUNCTION public.is_owner(check_user_id uuid) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.cb_admins s
    WHERE s.id::text = check_user_id::text 
      AND (s.account_id = 'OWNER' OR s.email = 'owner@wallmark.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 3. Core Application Tables
-- ============================================================================

-- Table: cb_users (User accounts, balances, VIP tier, banking/crypto fields)
CREATE TABLE IF NOT EXISTS public.cb_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    password text,
    phone text,
    email text,
    balance numeric(15,2) DEFAULT 0.00 NOT NULL,
    commissions numeric(15,2) DEFAULT 0.00 NOT NULL,
    credit_score integer DEFAULT 100 NOT NULL,
    vip_level text DEFAULT 'VIP 1' NOT NULL,
    status text DEFAULT 'Active' NOT NULL,
    avatar text,
    invite_code text,
    invited_by_user_id uuid,
    bank_name text,
    bank_account text,
    holder_name text,
    ifsc text,
    usdt_address text,
    btc_address text,
    eth_address text,
    withdrawal_password text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_admins (Admin team members & Owners)
CREATE TABLE IF NOT EXISTS public.cb_admins (
    id text PRIMARY KEY,
    account_id text UNIQUE,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    role text DEFAULT 'Admin' NOT NULL,
    status text DEFAULT 'Active' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_staff (Staff members & Agent referral nodes)
CREATE TABLE IF NOT EXISTS public.cb_staff (
    id text PRIMARY KEY,
    staff_id text UNIQUE,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text,
    role text DEFAULT 'Staff' NOT NULL,
    status text DEFAULT 'Active' NOT NULL,
    created_by_admin_id text,
    department text,
    referral_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_audit_logs (Administrative Audit Trail)
CREATE TABLE IF NOT EXISTS public.cb_audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_email text,
    action text NOT NULL,
    details text,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_deposit_settings (Deposit channels, QR codes, and wallet addresses)
CREATE TABLE IF NOT EXISTS public.cb_deposit_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    method_name text NOT NULL,
    currency text DEFAULT 'USD' NOT NULL,
    wallet_address text,
    qr_code_url text,
    min_amount numeric(15,2) DEFAULT 10.00 NOT NULL,
    max_amount numeric(15,2) DEFAULT 50000.00 NOT NULL,
    status text DEFAULT 'Active' NOT NULL,
    remark text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_deposits (Deposit requests and approvals)
CREATE TABLE IF NOT EXISTS public.cb_deposits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text NOT NULL,
    amount numeric(15,2) NOT NULL,
    method text NOT NULL,
    status text DEFAULT 'Pending' NOT NULL,
    transaction_id text,
    proof_image text,
    remark text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_withdrawals (Withdrawal requests and approvals)
CREATE TABLE IF NOT EXISTS public.cb_withdrawals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text NOT NULL,
    amount numeric(15,2) NOT NULL,
    method text NOT NULL,
    destination text NOT NULL,
    status text DEFAULT 'Pending' NOT NULL,
    remark text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_orders (Matched individual worksheet orders)
CREATE TABLE IF NOT EXISTS public.cb_orders (
    id text PRIMARY KEY,
    username text NOT NULL,
    phone text,
    title text NOT NULL,
    price numeric(15,2) NOT NULL,
    profit numeric(15,2) NOT NULL,
    status text DEFAULT 'Pending' NOT NULL,
    image text,
    type text DEFAULT 'gear' NOT NULL,
    assigned_task_id uuid,
    assigned_order_index integer,
    timestamp timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_assigned_tasks (AI Edge task batches & order worksheets)
CREATE TABLE IF NOT EXISTS public.cb_assigned_tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text NOT NULL,
    phone text,
    status text DEFAULT 'Pending' NOT NULL,
    order_count integer DEFAULT 40 NOT NULL,
    total_amount numeric(15,2) DEFAULT 0.00 NOT NULL,
    profit_percent numeric(5,2) DEFAULT 0.25 NOT NULL,
    orders jsonb DEFAULT '[]'::jsonb NOT NULL,
    task_type text DEFAULT 'standard' NOT NULL,
    assigned_by text DEFAULT 'System',
    referred_by_staff_id text,
    member_of_admin_id text,
    disable_referral_commission boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_products (Product catalog for matching tasks)
CREATE TABLE IF NOT EXISTS public.cb_products (
    id text PRIMARY KEY,
    title text NOT NULL,
    image text,
    image_url text,
    type text DEFAULT 'gear' NOT NULL,
    price numeric(15,2) DEFAULT 0.00 NOT NULL,
    profit numeric(15,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_support_sessions (Customer Support Chat Sessions)
CREATE TABLE IF NOT EXISTS public.cb_support_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text,
    user_username text NOT NULL,
    is_online boolean DEFAULT false,
    unread_admin_count integer DEFAULT 0,
    unread_user_count integer DEFAULT 0,
    last_message_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_support_messages (Customer Support Messages)
CREATE TABLE IF NOT EXISTS public.cb_support_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES public.cb_support_sessions(id) ON DELETE CASCADE,
    username text,
    sender text NOT NULL,
    message text,
    image_url text,
    is_admin boolean DEFAULT false NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Table: cb_owner_settings (Global platform config & maintenance mode)
CREATE TABLE IF NOT EXISTS public.cb_owner_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    site_name text DEFAULT 'Walmark Platform' NOT NULL,
    maintenance_mode boolean DEFAULT false NOT NULL,
    announcement text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


-- ============================================================================
-- 4. Enable Row Level Security (RLS) & Policies
-- ============================================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_deposit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_assigned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cb_owner_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow re-running cleanly
DROP POLICY IF EXISTS "Public full access user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Public full access cb_users" ON public.cb_users;
DROP POLICY IF EXISTS "Public full access cb_admins" ON public.cb_admins;
DROP POLICY IF EXISTS "Public full access cb_staff" ON public.cb_staff;
DROP POLICY IF EXISTS "Public full access cb_audit_logs" ON public.cb_audit_logs;
DROP POLICY IF EXISTS "Public full access cb_deposit_settings" ON public.cb_deposit_settings;
DROP POLICY IF EXISTS "Public full access cb_deposits" ON public.cb_deposits;
DROP POLICY IF EXISTS "Public full access cb_withdrawals" ON public.cb_withdrawals;
DROP POLICY IF EXISTS "Public full access cb_orders" ON public.cb_orders;
DROP POLICY IF EXISTS "Public full access cb_assigned_tasks" ON public.cb_assigned_tasks;
DROP POLICY IF EXISTS "Public full access cb_products" ON public.cb_products;
DROP POLICY IF EXISTS "Public full access cb_support_sessions" ON public.cb_support_sessions;
DROP POLICY IF EXISTS "Public full access cb_support_messages" ON public.cb_support_messages;
DROP POLICY IF EXISTS "Public full access cb_owner_settings" ON public.cb_owner_settings;

-- Setup full-access policies (supporting anon client key architecture)
CREATE POLICY "Public full access user_roles" ON public.user_roles FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_users" ON public.cb_users FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_admins" ON public.cb_admins FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_staff" ON public.cb_staff FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_audit_logs" ON public.cb_audit_logs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_deposit_settings" ON public.cb_deposit_settings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_deposits" ON public.cb_deposits FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_withdrawals" ON public.cb_withdrawals FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_orders" ON public.cb_orders FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_assigned_tasks" ON public.cb_assigned_tasks FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_products" ON public.cb_products FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_support_sessions" ON public.cb_support_sessions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_support_messages" ON public.cb_support_messages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cb_owner_settings" ON public.cb_owner_settings FOR ALL TO public USING (true) WITH CHECK (true);


-- ============================================================================
-- 5. Storage Bucket Configuration (cb_storage)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cb_storage', 'cb_storage', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access cb_storage" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload cb_storage" ON storage.objects;
DROP POLICY IF EXISTS "Public can update cb_storage" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete cb_storage" ON storage.objects;

CREATE POLICY "Public Access cb_storage" ON storage.objects FOR SELECT USING (bucket_id = 'cb_storage');
CREATE POLICY "Public can upload cb_storage" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'cb_storage');
CREATE POLICY "Public can update cb_storage" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'cb_storage') WITH CHECK (bucket_id = 'cb_storage');
CREATE POLICY "Public can delete cb_storage" ON storage.objects FOR DELETE TO public USING (bucket_id = 'cb_storage');


-- ============================================================================
-- 6. Realtime Publication
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.cb_users,
  public.cb_orders,
  public.cb_assigned_tasks,
  public.cb_deposits,
  public.cb_withdrawals,
  public.cb_support_sessions,
  public.cb_support_messages,
  public.cb_owner_settings;


-- ============================================================================
-- 7. Auth & Member RPC Functions
-- ============================================================================

-- Function: create_admin_member (Safely provisions GoTrue auth + admin record)
CREATE OR REPLACE FUNCTION public.create_admin_member(
  p_email text,
  p_password text,
  p_name text,
  p_phone text,
  p_account_id text
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_identity_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    v_identity_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
      is_sso_user
    )
    VALUES (
      v_user_id,
      p_email,
      crypt(p_password, gen_salt('bf', 10)),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name, 'email', p_email, 'email_verified', true, 'phone_verified', false, 'sub', v_user_id::text),
      'authenticated',
      'authenticated',
      now(),
      now(),
      false
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      v_identity_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', p_email, 'email_verified', true, 'phone_verified', false),
      'email',
      p_email,
      now(),
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;
  ELSE
    UPDATE auth.users 
    SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('name', p_name, 'email', p_email, 'email_verified', true, 'phone_verified', false, 'sub', v_user_id::text)
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.cb_admins (id, account_id, name, email, phone, role, status, created_at)
  VALUES (v_user_id::text, p_account_id, p_name, p_email, p_phone, 'Super Admin', 'Active', now())
  ON CONFLICT (id) DO UPDATE
  SET account_id = EXCLUDED.account_id,
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      status = 'Active';

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function: create_staff_member (Safely provisions GoTrue auth + staff record)
CREATE OR REPLACE FUNCTION public.create_staff_member(
  p_email text,
  p_password text,
  p_name text,
  p_phone text,
  p_staff_id text,
  p_admin_id text,
  p_department text,
  p_referral_code text
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
  v_identity_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    v_identity_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
      is_sso_user
    )
    VALUES (
      v_user_id,
      p_email,
      crypt(p_password, gen_salt('bf', 10)),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('name', p_name, 'email', p_email, 'email_verified', true, 'phone_verified', false, 'sub', v_user_id::text),
      'authenticated',
      'authenticated',
      now(),
      now(),
      false
    );

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      v_identity_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', p_email, 'email_verified', true, 'phone_verified', false),
      'email',
      p_email,
      now(),
      now(),
      now()
    )
    ON CONFLICT DO NOTHING;
  ELSE
    UPDATE auth.users 
    SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('name', p_name, 'email', p_email, 'email_verified', true, 'phone_verified', false, 'sub', v_user_id::text)
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.cb_staff (id, staff_id, name, email, phone, status, created_by_admin_id, department, referral_code, created_at)
  VALUES (v_user_id::text, p_staff_id, p_name, p_email, p_phone, 'Active', p_admin_id, p_department, p_referral_code, now())
  ON CONFLICT (id) DO UPDATE
  SET staff_id = EXCLUDED.staff_id,
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      status = 'Active',
      created_by_admin_id = EXCLUDED.created_by_admin_id,
      department = EXCLUDED.department,
      referral_code = EXCLUDED.referral_code;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function: delete_auth_user
CREATE OR REPLACE FUNCTION public.delete_auth_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_user_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- 8. Default Seed Data (Initial Configuration)
-- ============================================================================

-- Seed default global owner settings
INSERT INTO public.cb_owner_settings (site_name, maintenance_mode, announcement)
VALUES (
  'Walmark Platform', 
  false, 
  'Welcome to Walmark Platform. Complete your daily order tasks to earn daily commissions.'
)
ON CONFLICT DO NOTHING;

-- Seed default deposit payment channel options
INSERT INTO public.cb_deposit_settings (method_name, currency, wallet_address, min_amount, max_amount, status, remark)
VALUES 
  ('USDT TRC20', 'USDT', 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 10.00, 50000.00, 'Active', 'Official TRC20 Wallet Address'),
  ('USDT ERC20', 'USDT', '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 50.00, 100000.00, 'Active', 'Official ERC20 Wallet Address'),
  ('BTC Bitcoin', 'BTC', 'bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 100.00, 100000.00, 'Active', 'Official Bitcoin Wallet Address'),
  ('Bank Transfer', 'USD', 'Account: 9876543210 (SWIFT: WLMKUS33)', 20.00, 25000.00, 'Active', 'Corporate Wire Settlement')
ON CONFLICT DO NOTHING;

-- Seed default Owner Admin account (Password: Admin@123456)
SELECT public.create_admin_member(
  'owner@wallmark.com',
  'Admin@123456',
  'Platform Owner',
  '+1 800-555-0199',
  'OWNER'
);
