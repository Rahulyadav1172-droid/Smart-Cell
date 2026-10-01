-- ==========================================================
-- SMART CELL AYODHYA - DISTRICT POLICE COMMAND PORTAL
-- SUPABASE / POSTGRESQL PRODUCTION DATABASE SCHEMA
-- ==========================================================

-- 1. THANAS & POLICE STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.thanas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hindi_name TEXT NOT NULL,
    cug_number VARCHAR(15) UNIQUE NOT NULL,
    email TEXT,
    circle TEXT,
    category TEXT DEFAULT 'Thana',
    pin_hash TEXT NOT NULL DEFAULT '123456',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. C-PLAN RECORDS (SAMBHRANT NAGRIK / COMMUNITY POLICING)
CREATE TABLE IF NOT EXISTS public.c_plan_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thana_id TEXT REFERENCES public.thanas(id) ON DELETE RESTRICT,
    person_name TEXT NOT NULL,
    relative_name TEXT NOT NULL, -- Pita / Pati ka Naam
    mobile_number VARCHAR(15) NOT NULL,
    village_or_ward TEXT NOT NULL,
    category_profession TEXT NOT NULL, -- Pradhan, Vyapari, Retired Fauji, etc.
    beat_constable_name TEXT,
    beat_constable_mobile VARCHAR(15),
    id_proof_number TEXT,
    status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'VERIFIED', 'LOCKED')),
    remarks TEXT,
    created_by_cug VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- CRITICAL: DISTRICT-WIDE UNIQUE MOBILE NUMBER CONSTRAINT
CREATE UNIQUE INDEX IF NOT EXISTS idx_c_plan_mobile_unique ON public.c_plan_records (mobile_number);
CREATE INDEX IF NOT EXISTS idx_c_plan_thana ON public.c_plan_records (thana_id);
CREATE INDEX IF NOT EXISTS idx_c_plan_village ON public.c_plan_records (village_or_ward);

-- 3. E-OFFICE & VPN CREDENTIALS VAULT
CREATE TABLE IF NOT EXISTS public.eoffice_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thana_id TEXT UNIQUE REFERENCES public.thanas(id) ON DELETE CASCADE,
    vpn_username TEXT,
    vpn_password TEXT,
    eoffice_id TEXT,
    nic_email TEXT,
    assigned_system_ip TEXT,
    notes TEXT,
    last_updated_by TEXT DEFAULT 'Smart Cell Admin',
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. SMART CELL BROADCAST NOTICES / DIRECTIVES
CREATE TABLE IF NOT EXISTS public.broadcast_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'HIGH', 'URGENT')),
    issued_by TEXT DEFAULT 'Smart Cell Ayodhya',
    target_thanas TEXT[] DEFAULT ARRAY['ALL'], -- 'ALL' or array of thana IDs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. AUDIT LOGS FOR TAMPER DETECTION
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    action_type TEXT NOT NULL, -- LOGIN, VIEW_CREDENTIAL, ADD_C_PLAN, EXPORT_DATA
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- SEED DATA: INSERT ALL 21 AYODHYA POLICE STATIONS
-- ==========================================================
INSERT INTO public.thanas (id, name, hindi_name, cug_number, email, circle, category, pin_hash) VALUES
('kotwali-nagar', 'Kotwali Nagar', 'कोतवाली नगर', '9454403303', 'sho-kotnagar.ay@up.gov.in', 'Circle Nagar', 'Kotwali', '123456'),
('kotwali-cantt', 'Kotwali Cantt', 'कोतवाली कैंट', '9454403298', 'sho-cantt.ay@up.gov.in', 'Circle Cantt', 'Kotwali', '123456'),
('mahila-thana', 'Mahila Thana', 'महिला थाना', '9454403306', 'sho-mahilathana.ay@up.gov.in', 'Circle Nagar / HQ', 'Thana', '123456'),
('kotwali-ayodhya', 'Kotwali Ayodhya', 'कोतवाली अयोध्या', '9454403296', 'sho-kotayodhya.ay@up.gov.in', 'Circle Ayodhya', 'Kotwali', '123456'),
('ram-janm-bhoomi', 'Ram Janm Bhoomi', 'राम जन्म भूमि सुरक्षा थाना', '9454403310', 'sho-rjb.ay@up.gov.in', 'Circle RJB Suraksha', 'Thana', '123456'),
('poorakalandar', 'Poorakalandar', 'पूराकलंदर', '9454403309', 'sho-purakalander.ay@up.gov.in', 'Circle Ayodhya', 'Thana', '123456'),
('raunahi', 'Raunahi', 'रौनाही', '9454403311', 'sho-raunahi.ay@up.gov.in', 'Circle Sohawal', 'Thana', '123456'),
('maharajganj', 'Maharajganj', 'महाराजगंज', '9454403305', 'sho-mahrajganj.ay@up.gov.in', 'Circle Sadar', 'Thana', '123456'),
('gosainganj', 'Gosainganj', 'गोसाईंगंज', '9454403299', 'sho-gosaiganj.ay@up.gov.in', 'Circle Gosainganj', 'Thana', '123456'),
('kotwali-bikapur', 'Kotwali Bikapur', 'कोतवाली बीकापुर', '9454403297', 'sho-kotbikapur.ay@up.gov.in', 'Circle Bikapur', 'Kotwali', '123456'),
('tarun', 'Tarun', 'तारुन', '9454403313', 'sho-tarun.ay@up.gov.in', 'Circle Bikapur', 'Thana', '123456'),
('haiderganj', 'Haiderganj', 'हैदरगंज', '9454403300', 'sho-haiderganj.ay@up.gov.in', 'Circle Bikapur', 'Thana', '123456'),
('kotwali-inayat-nagar', 'Kotwali Inayat Nagar', 'कोतवाली इनायत नगर', '9454403301', 'sho-inshotnagar.ay@up.gov.in', 'Circle Milkipur', 'Kotwali', '123456'),
('kumarganj', 'Kumarganj', 'कुमारगंज', '9454403304', 'sho-kumarganj.ay@up.gov.in', 'Circle Milkipur', 'Thana', '123456'),
('khandasa', 'Khandasa', 'खंडासा', '9454403302', 'sho-khandasa.ay@up.gov.in', 'Circle Milkipur', 'Thana', '123456'),
('kotwali-rudauli', 'Kotwali Rudauli', 'कोतवाली रूदौली', '9454403312', 'sho-kotrudauli.ay@up.gov.in', 'Circle Rudauli', 'Kotwali', '123456'),
('mawai', 'Mawai', 'मवई', '9454403307', 'sho-mawai.ay@up.gov.in', 'Circle Rudauli', 'Thana', '123456'),
('patranga', 'Patranga', 'पटरंगा', '9454403308', 'patarangafzd@gmail.com', 'Circle Rudauli', 'Thana', '123456'),
('baba-bazar', 'Baba Bazar', 'बाबा बाजार', '9454403314', 'sho-bababazar.ay@up.gov.in', 'Circle Rudauli', 'Thana', '123456'),
('ahtu', 'AHTU (Anti Human Trafficking)', 'ए.एच.टी.यू (मानव तस्करी रोधी इकाई)', '7839860546', 'so-ahtu.ay@up.gov.in', 'District Crime Branch', 'Special Unit', '123456'),
('cyber-thana', 'Cyber Thana', 'साइबर क्राइम पुलिस थाना', '7839876653', 'sho-cybercrime.ay@up.gov.in', 'District Cyber Command', 'Special Unit', '123456')
ON CONFLICT (id) DO NOTHING;

-- SEED INITIAL E-OFFICE VAULT ROWS FOR EACH THANA
INSERT INTO public.eoffice_credentials (thana_id, vpn_username, vpn_password, eoffice_id, nic_email)
SELECT 
    t.id,
    'vpn_' || replace(t.id, '-', '_'),
    'Ayodhya#Police2026',
    'eof_' || replace(t.id, '-', '_'),
    t.email
FROM public.thanas t
ON CONFLICT (thana_id) DO NOTHING;
