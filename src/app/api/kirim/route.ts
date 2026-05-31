import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tds = parseFloat(searchParams.get('tds') ?? '0');

    let status: string;
    if (tds <= 150) {
      status = 'Layak Konsumsi';
    } else if (tds < 300) {
      status = 'Perlu Perhatian';
    } else {
      status = 'Tidak Layak';
    }

    // Simpan ke koleksi monitoring
    await adminDb.collection('monitoring').add({
      tds,
      status,
      created_at: FieldValue.serverTimestamp(),
    });

    // Jika TDS kritis, cek apakah sudah ada peringatan dalam 5 menit terakhir
    if (tds >= 300) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentAlert = await adminDb
        .collection('activities')
        .where('name', '==', 'Peringatan TDS Tinggi')
        .where('created_at', '>', fiveMinutesAgo)
        .limit(1)
        .get();

      if (recentAlert.empty) {
        await adminDb.collection('activities').add({
          name: 'Peringatan TDS Tinggi',
          status_text: 'Terpicu',
          value: `${Math.round(tds)} ppm`,
          status_class: 'ab-triggered',
          created_at: FieldValue.serverTimestamp(),
        });
      }
    }

    return new NextResponse('Data Terkirim', { status: 200 });
  } catch (error) {
    console.error('kirim error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
