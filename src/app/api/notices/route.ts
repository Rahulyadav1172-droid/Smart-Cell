import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const notices = store.getNotices();
    return NextResponse.json({ success: true, notices });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, priority, issuedBy } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const notice = store.addNotice({
      title,
      content,
      priority: priority || 'NORMAL',
      issuedBy: issuedBy || 'Smart Cell Ayodhya',
    });

    return NextResponse.json({ success: true, notice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
