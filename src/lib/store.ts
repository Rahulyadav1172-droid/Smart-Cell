import { AYODHYA_THANAS, SMART_CELL_ADMIN } from '@/data/thanas';
import { PoliceMitraRecord, EOfficeCredential, BroadcastNotice } from './types';
import { supabase } from './supabase';

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

  // Clean initial records - zero demo records
  private records: PoliceMitraRecord[] = [];


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

    const existing = this.records.find(
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

  public addRecord(data: Omit<PoliceMitraRecord, 'id' | 'sNo' | 'createdAt' | 'updatedAt'>) {
    const cleanedMobile = data.mobileNumber.replace(/\D/g, '').slice(-10);
    const dupCheck = this.checkMobileDuplicate(cleanedMobile);
    if (dupCheck?.isDuplicate) {
      throw new Error(
        `यह मोबाइल नंबर पहले से थाना ${dupCheck.thanaName} में ${dupCheck.existingRecord?.personName} के नाम पर पंजीकृत है!`
      );
    }

    const newRecord: PoliceMitraRecord = {
      ...data,
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sNo: this.records.length + 1,
      mobileNumber: cleanedMobile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.records.unshift(newRecord);

    // Sync to Supabase in background
    try {
      supabase
        .from('police_mitra_records')
        .insert({
          district: data.district || 'अयोध्या',
          circle: data.circle,
          thana_id: data.thanaId,
          thana_name: data.thanaName,
          halka_chowki: data.halkaChowki,
          gram_mohalla: data.gramMohalla,
          majra_name: data.majraName,
          distance_km: data.distanceKm,
          person_name: data.personName,
          designation_profession: data.designationProfession,
          mobile_number: cleanedMobile,
        })
        .then();
    } catch (e) {}

    return newRecord;
  }

  public bulkImport(recordsList: Omit<PoliceMitraRecord, 'id' | 'sNo' | 'createdAt' | 'updatedAt'>[]) {
    let importedCount = 0;
    let skippedDuplicates = 0;

    for (const item of recordsList) {
      const cleaned = item.mobileNumber.replace(/\D/g, '').slice(-10);
      if (cleaned.length === 10) {
        const dup = this.checkMobileDuplicate(cleaned);
        if (!dup?.isDuplicate) {
          this.records.push({
            ...item,
            id: `rec-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            sNo: this.records.length + 1,
            mobileNumber: cleaned,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          importedCount++;
        } else {
          skippedDuplicates++;
        }
      }
    }

    return { importedCount, skippedDuplicates, totalInStore: this.records.length };
  }

  public getRecords(thanaId?: string) {
    if (!thanaId || thanaId === 'all') {
      return this.records;
    }
    return this.records.filter((r) => r.thanaId === thanaId);
  }

  // Alias for backward compatibility
  public getCPlanRecords(thanaId?: string) {
    return this.getRecords(thanaId);
  }

  public addCPlanRecord(data: any) {
    return this.addRecord(data);
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

  private notices: BroadcastNotice[] = [
    {
      id: 'notice-1',
      title: 'संभ्रान्त व्यक्ति / पुलिस मित्र डेटाबेस अद्यतन अभियान',
      content: 'सभी थाना प्रभारी अपने-अपने क्षेत्र के प्रत्येक मुख्य ग्राम एवं मजरे से संभ्रान्त नागरिकों का विवरण समय से पूर्ण कराएं।',
      priority: 'HIGH',
      issuedBy: 'स्मार्ट सेल / पुलिस अधीक्षक अयोध्या',
      createdAt: new Date().toISOString(),
    },
  ];

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
    const totalRecords = this.records.length;
    const thanaWiseCounts: Record<string, number> = {};

    this.thanas.forEach((t) => {
      thanaWiseCounts[t.id] = 0;
    });

    this.records.forEach((r) => {
      if (thanaWiseCounts[r.thanaId] !== undefined) {
        thanaWiseCounts[r.thanaId]++;
      }
    });

    return {
      totalThanas: this.thanas.length,
      totalRecords,
      thanaWiseCounts,
    };
  }
}

declare global {
  var __smartCellStore: DataStore | undefined;
}

export const store = global.__smartCellStore || new DataStore();
if (process.env.NODE_ENV !== 'production') {
  global.__smartCellStore = store;
}
