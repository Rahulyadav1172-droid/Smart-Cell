import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const thanaId = searchParams.get('thanaId') || undefined;
    const credentials = store.getEOfficeCredentials(thanaId);
    return NextResponse.json({ success: true, credentials });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { thanaId, vpnUsername, vpnPassword, eofficeId, nicEmail, notes, assignedSystemIp } = body;

    if (!thanaId) {
      return NextResponse.json({ error: 'Thana ID is required' }, { status: 400 });
    }

    const updated = store.updateEOfficeCredential(thanaId, {
      vpnUsername,
      vpnPassword,
      eofficeId,
      nicEmail,
      notes,
      assignedSystemIp,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Thana credential not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, credential: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
