import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, status_text, value, status_class } = body;

    if (!name || !status_text || !value || !status_class) {
      return NextResponse.json({ status: 'error', message: 'No data received' }, { status: 400 });
    }

    await adminDb.collection('activities').add({
      name,
      status_text,
      value,
      status_class,
      created_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('add_activity error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
