import { AYODHYA_THANAS, SMART_CELL_ADMIN } from '@/data/thanas';
import { CPlanRecord, EOfficeCredential, BroadcastNotice } from './types';

// In-memory persistent singleton for the app runtime
class DataStore {
  private thanas = [...AYODHYA_THANAS];

  private eOfficeCredentials: EOfficeCredential[] = AYODHYA_THANAS.map((thana) => ({
    id: `eof-${thana.id}`,
    thanaId: thana.id,
    thanaName: thana.name,
    cug: thana.cug,
    vpnUsername: `vpn_${thana.id.replace(/-/g, '_')}`,
    vpnPassword: `Ayodhya#${thana.name.substring(0, 3)}2026!`,
    eofficeId: `eof_${thana.id.replace(/-/g, '_')}`,
    nicEmail: thana.email,
    assignedSystemIp: '10.152.44.' + (Math.floor(Math.random() * 150) + 20),
    notes: 'Official NIC e-Office FortiClient VPN Access Configured',
    lastUpdatedBy: 'Smart Cell HQ',
    updatedAt: new Date().toISOString(),
  }));

  private cPlanRecords: CPlanRecord[] = [
    {
      id: 'cplan-1',
      thanaId: 'kotwali-nagar',
      thanaName: 'Kotwali Nagar',
      personName: 'राम प्रकाश वर्मा',
      relativeName: 'श्री दीनदयाल वर्मा',
      mobileNumber: '9839123456',
      villageOrWard: 'वार्ड संख्या 12, सिविल लाइन्स',
      categoryProfession: 'व्यापारी / संभ्रांत नागरिक',
      beatConstableName: 'का. राहुल सिंह',
      beatConstableMobile: '9454499001',
      status: 'VERIFIED',
      remarks: 'शांति समिति सदस्य, सक्रिय नागरिक',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },
    {
      id: 'cplan-2',
      thanaId: 'kotwali-ayodhya',
      thanaName: 'Kotwali Ayodhya',
      personName: 'महंत सत्येंद्र दास',
      relativeName: 'गुरु कृपा',
      mobileNumber: '9838765432',
      villageOrWard: 'रामकोट मोहल्ला',
      categoryProfession: 'धर्मगुरु / संभ्रांत नागरिक',
      beatConstableName: 'हे.का. अमित कुमार',
      beatConstableMobile: '9454499002',
      status: 'VERIFIED',
      remarks: 'मंदिर परिसर समिति',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: 'cplan-3',
      thanaId: 'kotwali-bikapur',
      thanaName: 'Kotwali Bikapur',
      personName: 'सुरेश बहादुर सिंह',
      relativeName: 'श्री जयपाल सिंह',
      mobileNumber: '9415678901',
      villageOrWard: 'ग्राम पंचायत जलालपुर',
      categoryProfession: 'ग्राम प्रधान',
      beatConstableName: 'का. पंकज यादव',
      beatConstableMobile: '9454499003',
      status: 'SUBMITTED',
      remarks: 'पंचायत प्रतिनिधि',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'cplan-4',
      thanaId: 'cyber-thana',
      thanaName: 'Cyber Thana',
      personName: 'अनिल कुमार श्रीवास्तव',
      relativeName: 'श्री आर.के. श्रीवास्तव',
      mobileNumber: '9919876540',
      villageOrWard: 'टेढ़ी बाजार',
      categoryProfession: 'आईटी विशेषज्ञ / साइबर वॉलंटियर',
      beatConstableName: 'उप निरीक्षक साइबर सेल',
      beatConstableMobile: '7839876653',
      status: 'VERIFIED',
      remarks: 'साइबर जागरूकता वॉलिंटियर',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    }
  ];

  private notices: BroadcastNotice[] = [
    {
      id: 'notice-1',
      title: 'C-Plan संभ्रांत नागरिक डाटा अपडेशन अभियान 2026',
      content: 'सभी थाना प्रभारी / CUG धारक अपने क्षेत्र के प्रत्येक बीट/गांव से कम से कम 25 संभ्रांत नागरिकों (ग्राम प्रधान, पूर्व सैनिक, शिक्षक, व्यापारी) का विवरण तत्काल C-Plan पोर्टल पर दर्ज करें। मोबाइल नंबर की शुद्धता अनिवार्य है।',
      priority: 'URGENT',
      issuedBy: 'पुलिस अधीक्षक / स्मार्ट सेल अयोध्या',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notice-2',
      title: 'e-Office नया VPN पासवर्ड दिशा-निर्देश',
      content: 'NIC द्वारा e-Office VPN पासवर्ड पॉलिसी अपडेट की गई है। सभी थाने अपने क्रेडेंशियल वॉल्ट से नया VPN पासवर्ड प्राप्त करें एवं सुरक्षित रखें। किसी भी परिस्थिति में WhatsApp ग्रुप में शेयर न करें।',
      priority: 'HIGH',
      issuedBy: 'स्मार्ट सेल / कंप्यूटर शाखा',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ];

  public getThanas() {
    return this.thanas;
  }

  public getThanaByCug(cug: string) {
    return this.thanas.find((t) => t.cug.trim() === cug.trim());
  }

  public getThanaById(id: string) {
    return this.thanas.find((t) => t.id === id);
  }

  public checkMobileDuplicate(mobileNumber: string, excludeId?: string) {
    const cleaned = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) return null;

    const existing = this.cPlanRecords.find(
      (r) => r.mobileNumber.replace(/\D/g, '').slice(-10) === cleaned && r.id !== excludeId
    );

    if (existing) {
      return {
        isDuplicate: true,
        existingRecord: existing,
        thanaName: existing.thanaName,
      };
    }
    return { isDuplicate: false };
  }

  public addCPlanRecord(data: Omit<CPlanRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const cleanedMobile = data.mobileNumber.replace(/\D/g, '').slice(-10);
    const dupCheck = this.checkMobileDuplicate(cleanedMobile);
    if (dupCheck?.isDuplicate) {
      throw new Error(
        `यह मोबाइल नंबर पहले से थाना ${dupCheck.thanaName} में ${dupCheck.existingRecord?.personName} के नाम पर पंजीकृत है!`
      );
    }

    const newRecord: CPlanRecord = {
      ...data,
      id: `cplan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mobileNumber: cleanedMobile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.cPlanRecords.unshift(newRecord);
    return newRecord;
  }

  public getCPlanRecords(thanaId?: string) {
    if (!thanaId || thanaId === 'all') {
      return this.cPlanRecords;
    }
    return this.cPlanRecords.filter((r) => r.thanaId === thanaId);
  }

  public updateCPlanStatus(id: string, status: 'SUBMITTED' | 'VERIFIED' | 'LOCKED') {
    const record = this.cPlanRecords.find((r) => r.id === id);
    if (record) {
      record.status = status;
      record.updatedAt = new Date().toISOString();
      return record;
    }
    return null;
  }

  public getEOfficeCredentials(thanaId?: string) {
    if (!thanaId || thanaId === 'all') {
      return this.eOfficeCredentials;
    }
    return this.eOfficeCredentials.filter((c) => c.thanaId === thanaId);
  }

  public updateEOfficeCredential(thanaId: string, updates: Partial<EOfficeCredential>) {
    const cred = this.eOfficeCredentials.find((c) => c.thanaId === thanaId);
    if (cred) {
      Object.assign(cred, {
        ...updates,
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: 'Smart Cell Admin',
      });
      return cred;
    }
    return null;
  }

  public getNotices() {
    return this.notices;
  }

  public addNotice(notice: Omit<BroadcastNotice, 'id' | 'createdAt'>) {
    const newNotice: BroadcastNotice = {
      ...notice,
      id: `notice-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.notices.unshift(newNotice);
    return newNotice;
  }

  public getDistrictStats() {
    const totalRecords = this.cPlanRecords.length;
    const verifiedRecords = this.cPlanRecords.filter((r) => r.status === 'VERIFIED').length;
    const thanaWiseCounts: Record<string, number> = {};

    this.thanas.forEach((t) => {
      thanaWiseCounts[t.id] = 0;
    });

    this.cPlanRecords.forEach((r) => {
      if (thanaWiseCounts[r.thanaId] !== undefined) {
        thanaWiseCounts[r.thanaId]++;
      }
    });

    return {
      totalThanas: this.thanas.length,
      totalRecords,
      verifiedRecords,
      pendingRecords: totalRecords - verifiedRecords,
      thanaWiseCounts,
      topPerformingThanas: Object.entries(thanaWiseCounts)
        .map(([thanaId, count]) => {
          const thana = this.getThanaById(thanaId);
          return { thanaId, name: thana?.name || thanaId, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }
}

// Global singleton across Next.js API reloads
declare global {
  var __smartCellStore: DataStore | undefined;
}

export const store = global.__smartCellStore || new DataStore();
if (process.env.NODE_ENV !== 'production') {
  global.__smartCellStore = store;
}
