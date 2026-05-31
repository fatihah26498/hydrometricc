import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('activities')
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();

    const rows = snapshot.docs.map((doc) => {
      const d = doc.data();
      const date: Date = d.created_at?.toDate?.() ?? new Date();
      const time = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return {
        name: d.name,
        status_text: d.status_text,
        value: d.value,
        status_class: d.status_class,
        time,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error('get_activities error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
