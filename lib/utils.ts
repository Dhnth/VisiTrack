import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function maskNIK(nik: string | null | undefined): string {
  if (!nik || nik.length === 0) return '-';
  if (nik.length < 8) return nik;
  // Contoh: 3172010101010001 → 3172****0001
  const firstFour = nik.slice(0, 4);
  const lastFour = nik.slice(-4);
  return `${firstFour}****${lastFour}`;
}

export function maskNIKFull(nik: string | null | undefined): string {
  if (!nik || nik.length === 0) return '-';
  if (nik.length < 8) return nik;
  // Contoh: 3172010101010001 → 3172***********0001
  const firstFour = nik.slice(0, 4);
  const lastFour = nik.slice(-4);
  const asteriskCount = nik.length - 8;
  return `${firstFour}${'*'.repeat(asteriskCount)}${lastFour}`;
}