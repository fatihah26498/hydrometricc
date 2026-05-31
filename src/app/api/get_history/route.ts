import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('monitoring')
      .orderBy('created_at', 'desc')
      .limit(24)
      .get();

    const rows = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        const date: Date = d.created_at?.toDate?.() ?? new Date();
        const label = date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return { label, tds: d.tds as number };
      })
      .reverse(); // chart butuh urutan waktu ASC

    return NextResponse.json(rows);
  } catch (error) {
    console.error('get_history error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
