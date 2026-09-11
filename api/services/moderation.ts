export type ModerationDecision = "approved" | "rejected" | "pending";

export interface ModerationResult {
  decision: ModerationDecision;
  reason: string;
}

/**
 * MVP: auto-approve semua upload yang lolos validasi Sharp.
 * Kembalikan { decision: "pending" } untuk mewajibkan review admin,
 * atau sambungkan provider eksternal — kontrak return tidak berubah.
 */
export async function reviewImage(
  _bytes: Uint8Array,
  _mime: string,
): Promise<ModerationResult> {
  return { decision: "approved", reason: "auto-approve" };
}
