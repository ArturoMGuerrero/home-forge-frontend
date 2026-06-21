export const PHONE_E164 = /^\+[1-9]\d{1,14}$/;
export const ISO_CURRENCY = /^[A-Z]{3}$/;
export const COUNTRY_CODE = /^[A-Z]{2}$/;
export function isValidPhone(phone: string): boolean { return PHONE_E164.test(phone); }
