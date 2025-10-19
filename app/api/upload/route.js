import Busboy from "busboy";
import { put } from '@vercel/blob';
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const filename = `restaurant-${timestamp}-${randomString}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Vercel Blob
    const { url } = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({ url, filename });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Helper function for Pages Router to parse multipart form data
async function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const bb =Busboy({ headers: req.headers });
    const fields = {};
    const files = {};

    bb.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    bb.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];

      file.on('data', (chunk) => {
        chunks.push(chunk);
      });

      file.on('end', () => {
        files[fieldname] = {
          buffer: Buffer.concat(chunks),
          originalname: filename,
          mimetype: mimeType,
          size: Buffer.concat(chunks).length,
        };
      });
    });

    bb.on('finish', () => {
      resolve({ fields, files });
    });

    bb.on('error', (err) => {
      reject(err);
    });

    req.pipe(bb);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};