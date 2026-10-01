-- ==========================================================
-- SMART CELL AYODHYA - POLICE MITRA & C-PLAN DATABASE
-- EXACT 11 HEADINGS MATCHING DISTRICT POLICE FORMAT
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

-- 2. POLICE MITRA / SAMBHRANT NAGRIK (EXACT 11 COLUMNS)
-- 1. क्र0सं0 (s_no)
-- 2. जनपद (district)
-- 3. सर्किल (circle)
-- 4. थाना (thana_name)
-- 5. हल्का/चौकी (halka_chowki)
-- 6. ग्राम/मौहल्ला (gram_mohalla)
-- 7. मजरे का नाम (majra_name)
-- 8. मुख्य ग्राम/मुहल्ले से मजरे की दूरी (distance_km)
-- 9. संभ्रान्त व्यक्ति/पुलिस मित्र का नाम (person_name)
-- 10. पदनाम/व्यवसाय (designation_profession)
-- 11. मो0नं0 (mobile_number)
CREATE TABLE IF NOT EXISTS public.police_mitra_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    s_no SERIAL,
    district TEXT DEFAULT 'अयोध्या',
    circle TEXT NOT NULL,
    thana_id TEXT REFERENCES public.thanas(id),
    thana_name TEXT NOT NULL,
    halka_chowki TEXT DEFAULT '—',
    gram_mohalla TEXT NOT NULL,
    majra_name TEXT DEFAULT 'मुख्य बस्ती',
    distance_km TEXT DEFAULT '0',
    person_name TEXT NOT NULL,
    designation_profession TEXT NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- CRITICAL: DISTRICT-WIDE UNIQUE MOBILE NUMBER CHECK
CREATE UNIQUE INDEX IF NOT EXISTS idx_police_mitra_mobile ON public.police_mitra_records (mobile_number);
CREATE INDEX IF NOT EXISTS idx_police_mitra_thana ON public.police_mitra_records (thana_id);
CREATE INDEX IF NOT EXISTS idx_police_mitra_gram ON public.police_mitra_records (gram_mohalla);

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

-- 4. SEED DATA: INSERT ALL 21 AYODHYA POLICE STATIONS
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

-- 5. SEED INITIAL E-OFFICE VAULT ROWS
INSERT INTO public.eoffice_credentials (thana_id, vpn_username, vpn_password, eoffice_id, nic_email)
SELECT 
    t.id,
    'vpn_' || replace(t.id, '-', '_'),
    'Ayodhya#Police2026',
    'eof_' || replace(t.id, '-', '_'),
    t.email
FROM public.thanas t
ON CONFLICT (thana_id) DO NOTHING;
