import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const thanaId = searchParams.get('thanaId') || undefined;
    const records = store.getCPlanRecords(thanaId);
    return NextResponse.json({ success: true, count: records.length, records });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      thanaId,
      thanaName,
      personName,
      relativeName,
      mobileNumber,
      villageOrWard,
      categoryProfession,
      beatConstableName,
      beatConstableMobile,
      remarks,
    } = body;

    if (!thanaId || !personName || !relativeName || !mobileNumber || !villageOrWard || !categoryProfession) {
      return NextResponse.json(
        { error: 'कृपया सभी आवश्यक फ़ील्ड्स (नाम, पिता/पति का नाम, मोबाइल, गाँव/वार्ड, वर्ग) भरें!' },
        { status: 400 }
      );
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return NextResponse.json(
        { error: 'मोबाइल नंबर 10 अंकों का वैध भारतीय नंबर होना अनिवार्य है!' },
        { status: 400 }
      );
    }

    const newRecord = store.addCPlanRecord({
      thanaId,
      thanaName: thanaName || 'Unknown Thana',
      personName,
      relativeName,
      mobileNumber: cleanMobile,
      villageOrWard,
      categoryProfession,
      beatConstableName,
      beatConstableMobile,
      remarks,
      status: 'SUBMITTED',
    });

    return NextResponse.json({ success: true, record: newRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save record' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and Status are required' }, { status: 400 });
    }

    const updated = store.updateCPlanStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
