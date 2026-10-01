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

export interface CPlanRecord {
  id: string;
  thanaId: string;
  thanaName: string;
  personName: string;
  relativeName: string; // Father / Husband name
  mobileNumber: string;
  villageOrWard: string;
  categoryProfession: string; // Pradhan, BDC, Vyapari, Sambhrant Nagrik, Retired Fauji, Shikshak, etc.
  beatConstableName?: string;
  beatConstableMobile?: string;
  status: 'SUBMITTED' | 'VERIFIED' | 'LOCKED';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

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
  cug: string;
  email: string;
  circle?: string;
}
