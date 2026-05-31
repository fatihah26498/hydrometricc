import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HydroMetric — Pemantau Kualitas Air',
  description: 'Sistem monitoring kualitas air berbasis TDS sensor dan ESP32',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
