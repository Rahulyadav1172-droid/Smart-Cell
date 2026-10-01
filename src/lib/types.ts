export interface Thana {
  id: string;
  name: string;
  hindiName: string;
  cug: string;
  email: string;
  circle: string;
  category: 'Kotwali' | 'Thana' | 'Special Unit';
  defaultPin: string;
}

export interface PoliceMitraRecord {
  id: string;
  sNo?: number;
  district: string; // जनपद (अयोध्या)
  circle: string; // सर्किल
  thanaId: string;
  thanaName: string; // थाना
  halkaChowki: string; // हल्का/चौकी
  gramMohalla: string; // ग्राम/मौहल्ला
  majraName: string; // मजरे का नाम
  distanceKm: string; // मुख्य ग्राम/मुहल्ले से मजरे की दूरी (किमी में)
  personName: string; // संभ्रान्त व्यक्ति/पुलिस मित्र का नाम
  designationProfession: string; // पदनाम/व्यवसाय
  mobileNumber: string; // मो0नं0
  createdAt: string;
  updatedAt: string;
}

// Backward compatibility alias
export type CPlanRecord = PoliceMitraRecord;

export interface EOfficeCredential {
  id: string;
  thanaId: string;
  thanaName: string;
  cug: string;
  vpnUsername: string;
  vpnPassword: string;
  eofficeId: string;
  nicEmail: string;
  assignedSystemIp?: string;
  notes?: string;
  lastUpdatedBy: string;
  lastViewedAt?: string;
  updatedAt: string;
}

export interface BroadcastNotice {
  id: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  issuedBy: string;
  createdAt: string;
}

export interface UserSession {
  role: 'THANA' | 'SUPER_ADMIN';
  thanaId?: string;
  thanaName: string;
  hindiName?: string;
  cug: string;
  email: string;
  circle?: string;
}
