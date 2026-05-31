# WaterIden — HydroMetric Water Quality Monitor

Sistem monitoring kualitas air berbasis TDS sensor, ESP32, Firebase Firestore, dan Next.js (deploy di Vercel).

## Arsitektur

```
ESP32 ──── GET /api/kirim?tds=xxx ────▶ Vercel (Next.js)
                                              │
                                         Firebase Firestore
                                              │
Browser ◀── fetch /api/getdata ─────────────┘
```

## Setup Firebase

### 1. Buat Project Firebase
1. Buka https://console.firebase.google.com
2. **Add project** → beri nama (contoh: `wateriden`)
3. Aktifkan **Firestore Database** (mode Production)
4. Buat 2 koleksi: `monitoring` dan `activities`

### 2. Firestore Security Rules
Di Firebase Console → Firestore → Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Hanya server (Admin SDK) yang bisa tulis
    // Frontend tidak perlu akses langsung ke Firestore
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Buat Service Account (untuk Admin SDK)
1. Firebase Console → Project Settings → **Service accounts**
2. Klik **Generate new private key** → download JSON
3. Dari file JSON tersebut, ambil:
   - `project_id`
   - `client_email`
   - `private_key`

### 4. Konfigurasi Environment Variables

#### Untuk development lokal:
Salin `.env.local` dan isi dengan nilai Firebase kamu:
```bash
cp .env.local .env.local.bak  # backup template
```

Edit `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Catatan FIREBASE_PRIVATE_KEY**: Pastikan `\n` tetap sebagai literal `\n` (bukan newline sungguhan) di file .env.local.

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/wateriden.git
git push -u origin main
```

### 2. Import ke Vercel
1. Buka https://vercel.com/new
2. Import repository GitHub kamu
3. Pada bagian **Environment Variables**, tambahkan semua variabel dari `.env.local`
4. Untuk `FIREBASE_PRIVATE_KEY`, paste nilai private key lengkap termasuk `-----BEGIN PRIVATE KEY-----`
5. Klik **Deploy**

### 3. Catat URL Vercel
Setelah deploy, kamu akan dapat URL seperti:
```
https://wateriden-xxx.vercel.app
```

## Konfigurasi ESP32

Ganti kode ESP32 kamu untuk kirim data ke endpoint Vercel:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid     = "NAMA_WIFI";
const char* password = "PASSWORD_WIFI";
// Ganti dengan URL Vercel kamu
const char* serverUrl = "https://wateriden-xxx.vercel.app/api/kirim";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float tds = bacaSensorTDS(); // fungsi baca sensor TDS kamu

    HTTPClient http;
    String url = String(serverUrl) + "?tds=" + String(tds, 1);
    http.begin(url);
    int httpCode = http.GET();

    if (httpCode == 200) {
      Serial.println("Data terkirim: " + String(tds) + " ppm");
    } else {
      Serial.println("Gagal kirim: " + String(httpCode));
    }
    http.end();
  }
  delay(5000); // kirim tiap 5 detik
}
```

## API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/kirim?tds=xxx` | GET | ESP32 kirim data TDS |
| `/api/getdata` | GET | Ambil data TDS terbaru |
| `/api/get_history` | GET | Ambil 24 data terakhir untuk chart |
| `/api/get_activities` | GET | Ambil 5 aktivitas terbaru |
| `/api/add_activity` | POST | Tambah aktivitas |

## Struktur Project

```
wateriden-vercel/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── getdata/route.ts       ← getdata.php
│   │   │   ├── kirim/route.ts         ← kirim.php (ESP32)
│   │   │   ├── get_history/route.ts   ← get_history.php
│   │   │   ├── get_activities/route.ts← get_activities.php
│   │   │   └── add_activity/route.ts  ← add_activity.php
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── firebase.ts        ← Firebase client SDK
│       └── firebase-admin.ts  ← Firebase Admin SDK (server)
├── public/
│   └── monitoring.html        ← Frontend (asli, fetch sudah diupdate)
├── .env.local                 ← Template env vars
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```
