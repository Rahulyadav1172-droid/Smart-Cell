import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const thanaId = searchParams.get('thanaId') || undefined;
    const records = store.getRecords(thanaId);
    return NextResponse.json({ success: true, count: records.length, records });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check for Bulk CSV Import
    if (body.bulk && Array.isArray(body.records)) {
      const result = store.bulkImport(body.records);
      return NextResponse.json({ success: true, result });
    }

    const {
      district,
      circle,
      thanaId,
      thanaName,
      halkaChowki,
      gramMohalla,
      majraName,
      distanceKm,
      personName,
      designationProfession,
      mobileNumber,
    } = body;

    if (!personName || !mobileNumber || !gramMohalla || !thanaName) {
      return NextResponse.json(
        { error: 'कृपया आवश्यक विवरण (ग्राम/मौहल्ला, संभ्रान्त व्यक्ति का नाम, मोबाइल नं) अवश्य भरें!' },
        { status: 400 }
      );
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return NextResponse.json(
        { error: 'मोबाइल नंबर 10 अंकों का वैध नंबर होना अनिवार्य है!' },
        { status: 400 }
      );
    }

    const newRecord = store.addRecord({
      district: district || 'अयोध्या',
      circle: circle || 'सर्किल नगर',
      thanaId: thanaId || 'kotwali-nagar',
      thanaName: thanaName || 'कोतवाली नगर',
      halkaChowki: halkaChowki || '—',
      gramMohalla: gramMohalla,
      majraName: majraName || 'मुख्य बस्ती',
      distanceKm: distanceKm || '0',
      personName: personName,
      designationProfession: designationProfession || 'संभ्रान्त नागरिक',
      mobileNumber: cleanMobile,
    });

    return NextResponse.json({ success: true, record: newRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save record' }, { status: 400 });
  }
}
