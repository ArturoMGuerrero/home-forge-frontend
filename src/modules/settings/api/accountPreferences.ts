const avatarKey = (userId?: string) => `homeforge_user_avatar_${userId || 'current'}`;

export const ACCOUNT_PREFERENCES_EVENT = 'homeforge-account-preferences';

export function getUserAvatar(userId?: string) {
  return localStorage.getItem(avatarKey(userId)) ?? '';
}

export function setUserAvatar(userId: string | undefined, value: string) {
  if (value) localStorage.setItem(avatarKey(userId), value);
  else localStorage.removeItem(avatarKey(userId));
  window.dispatchEvent(new Event(ACCOUNT_PREFERENCES_EVENT));
}
