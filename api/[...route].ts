import { bridgeHandler } from "./_bridge.js";

// Vercel Node function catch-all: SATU function menangani seluruh /api/*
// dengan meneruskan request mentah ke Elysia lewat bridge. Jangan menyalin
// logika bridge ke sini — duplikasi itulah yang membuat konversi body
// string (melanggar biner multipart) lolos ke produksi.
export const config = { api: { bodyParser: false } };

export default bridgeHandler;
