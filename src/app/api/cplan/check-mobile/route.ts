import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');
    const excludeId = searchParams.get('excludeId') || undefined;

    if (!mobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const check = store.checkMobileDuplicate(mobile, excludeId);
    if (!check) {
      return NextResponse.json({ isDuplicate: false, message: 'Invalid length' });
    }

    return NextResponse.json(check);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
