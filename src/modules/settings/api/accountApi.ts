import { getJson, patchJson, postJson } from '../../../shared/services/api';
import { updateSessionAccount } from '../../auth';

export type AccountProfile = {
  fullName: string;
  email: string;
  phoneE164?: string;
  role: string;
};

export function getAccount(): Promise<AccountProfile> {
  return getJson<AccountProfile>('/account');
}

export async function updateAccountProfile(changes: { fullName: string; phoneE164?: string }): Promise<AccountProfile> {
  const profile = await patchJson<AccountProfile>('/account/profile', changes);
  updateSessionAccount({ name: profile.fullName });
  return profile;
}

/** Cambia la contraseña; el servidor cierra las demás sesiones y entrega un token nuevo para esta. */
export async function changeAccountPassword(currentPassword: string, newPassword: string): Promise<void> {
  const { token } = await postJson<{ token: string }>('/account/password', { currentPassword, newPassword });
  updateSessionAccount({ token });
}
