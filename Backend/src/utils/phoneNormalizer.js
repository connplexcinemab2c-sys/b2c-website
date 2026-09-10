/**
 * Phone Number Normalization Utility
 * Standardizes phone numbers to standard 91XXXXXXXXXX format (E.164 without leading +)
 */

export const normalizePhoneNumber = (phone) => {
  if (!phone) return null;

  // Convert to string and remove all non-numeric characters
  const cleaned = String(phone).replace(/\D/g, "");

  if (!cleaned) return null;

  // 10-digit Indian mobile number (e.g., 9876543210 -> 919876543210)
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }

  // 11-digit number with leading 0 (e.g., 09876543210 -> 919876543210)
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    return `91${cleaned.slice(1)}`;
  }

  // 12-digit number already with 91 prefix (e.g., 919876543210)
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned;
  }

  // Fallback: return cleaned string if already formatted or international
  return cleaned;
};

export default normalizePhoneNumber;
