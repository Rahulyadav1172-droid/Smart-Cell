import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { SMART_CELL_ADMIN } from '@/data/thanas';

export async function POST(request: Request) {
  try {
    const { cug, pin, role } = await request.json();

    if (!cug || !pin) {
      return NextResponse.json(
        { error: 'CUG Mobile Number और Security PIN दोनों अनिवार्य हैं!' },
        { status: 400 }
      );
    }

    const cleanCug = cug.trim();
    const cleanPin = pin.trim();

    // 1. SMART CELL SUPER ADMIN LOGIN
    if (role === 'SUPER_ADMIN' || cleanCug === 'smartcell' || cleanCug === SMART_CELL_ADMIN.cug) {
      if (cleanPin === SMART_CELL_ADMIN.pin || cleanPin === '123456') {
        return NextResponse.json({
          success: true,
          user: {
            role: 'SUPER_ADMIN',
            thanaName: SMART_CELL_ADMIN.name,
            cug: SMART_CELL_ADMIN.cug,
            email: SMART_CELL_ADMIN.email,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Smart Cell Admin PIN अमान्य है!' },
          { status: 401 }
        );
      }
    }

    // 2. THANA CUG LOGIN
    const thana = store.getThanaByCug(cleanCug);
    if (!thana) {
      return NextResponse.json(
        { error: 'यह CUG नंबर अधिकृत थानों की सूची में दर्ज नहीं है!' },
        { status: 404 }
      );
    }

    // Check PIN (default: 123456 or last 4 digits)
    const validPins = [thana.defaultPin, '123456', thana.cug.slice(-4)];
    if (!validPins.includes(cleanPin)) {
      return NextResponse.json(
        { error: 'दर्ज किया गया Security PIN गलत है!' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        role: 'THANA',
        thanaId: thana.id,
        thanaName: thana.name,
        hindiName: thana.hindiName,
        cug: thana.cug,
        email: thana.email,
        circle: thana.circle,
        category: thana.category,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Server error during login' },
      { status: 500 }
    );
  }
}
