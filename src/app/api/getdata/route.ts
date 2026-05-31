import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('monitoring')
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        tds: 0,
        status: 'Belum Ada Data',
        created_at: new Date().toISOString(),
      });
    }

    const doc = snapshot.docs[0].data();
    return NextResponse.json({
      tds: doc.tds,
      status: doc.status,
      created_at: doc.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    });
  } catch (error) {
    console.error('getdata error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
