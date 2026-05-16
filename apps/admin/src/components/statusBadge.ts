export function statusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (["DELIVERED", "APPROVED", "CLEAR"].includes(s)) return "badge badge--success";
  if (
    ["FAILED", "CANCELLED", "MATCH", "BLOCK", "REJECTED"].includes(s) ||
    s.includes("FAIL")
  )
    return "badge badge--danger";
  if (
    ["PROCESSING", "INITIATED", "PENDING", "PENDING_REVIEW", "NEEDS_REVIEW"].includes(s) ||
    s.includes("PEND")
  )
    return "badge badge--warn";
  return "badge badge--neutral";
}
