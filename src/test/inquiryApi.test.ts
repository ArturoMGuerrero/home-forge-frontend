import { describe, expect, it } from 'vitest';
import { toE164 } from '../modules/properties/api/inquiryApi';

describe('teléfono del formulario "Me interesa"', () => {
  it('toma diez dígitos como número de México', () => {
    expect(toE164('442 123 4567')).toBe('+524421234567');
    expect(toE164('(442) 123-45-67')).toBe('+524421234567');
  });

  it('respeta la lada internacional', () => {
    expect(toE164('+1 915 555 1234')).toBe('+19155551234');
    expect(toE164('0052 442 123 4567')).toBe('+524421234567');
  });

  it('rechaza lo que no parece teléfono', () => {
    expect(toE164('12345')).toBeNull();
    expect(toE164('')).toBeNull();
    expect(toE164('hola')).toBeNull();
  });
});
