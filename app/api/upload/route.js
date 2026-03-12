/**
 * app/api/upload/route.js
 *
 * Next.js Route Handler — proxies image uploads to the Express backend.
 * Replaced @vercel/blob with local-disk storage via the backend endpoint:
 *   POST {BACKEND_URL}/api/v1/upload/image
 *
 * Accepts:  multipart/form-data  with field "file"  (kept for backward compat)
 *           or field "image"  (new standard field name for the backend)
 * Returns:  { url, filename }  — same shape as the old Vercel Blob response
 *           so existing callers don't need to change.
 */

import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:5000';

export async function POST(request) {
  try {
    const incomingForm = await request.formData();

    // Support both field names: "file" (legacy) and "image" (new backend standard)
    const file = incomingForm.get('file') || incomingForm.get('image');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded. Use field name "file" or "image".' },
        { status: 400 }
      );
    }

    // ── Basic client-side validation (mirrors backend limits) ────────────────
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed.' },
        { status: 415 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5 MB.' },
        { status: 413 }
      );
    }

    // ── Forward the file to the Express backend ──────────────────────────────
    const outgoingForm = new FormData();
    // Backend multer expects field name "image"
    outgoingForm.append('image', file, file.name);

    // Pass the auth token through if present in the request headers
    const authHeader = request.headers.get('authorization') || '';

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/upload/image`, {
      method: 'POST',
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
      body: outgoingForm,
    });

    if (!backendRes.ok) {
      const errData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || 'Backend upload failed.' },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    // Return { url, filename } for backward compatibility
    // (old code reads data.url; apiService.uploadImage reads data.imageUrl — both work)
    return NextResponse.json({
      url: data.imageUrl,
      imageUrl: data.imageUrl,
      filename: data.filename,
    });
  } catch (error) {
    console.error('[/api/upload] Proxy error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
