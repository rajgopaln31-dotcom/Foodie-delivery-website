export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isMobile = (v: string): boolean => /^[6-9]\d{9}$/.test(v.trim());
export const isPin = (v: string): boolean => /^[1-9]\d{5}$/.test(v.trim());
export const isUpi = (v: string): boolean => /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());

export function passwordError(v: string): string | undefined {
  if (!v) return 'Password is required';
  if (v.length < 6) return 'Password must be at least 6 characters';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Use at least one letter and one number';
  return undefined;
}

export function cardExpiryError(v: string): string | undefined {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
  if (!m) return 'Enter expiry as MM/YY';
  const now = new Date();
  const year = 2000 + Number(m[2]);
  const month = Number(m[1]);
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return 'Card has expired';
  }
  return undefined;
}
