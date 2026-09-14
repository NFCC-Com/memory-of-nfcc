import { neon } from "@neondatabase/serverless";

// Disengaja malas: neon() tidak membuka koneksi saat init, jadi placeholder
// membuat import tak pernah meledak (mis. deploy tanpa DATABASE_URL).
// Kegagalan koneksi muncul jelas saat query pertama dijalankan.
const url = process.env.DATABASE_URL ?? "postgresql://localhost:5432/neon-placeholder";

export const sql = neon(url);
