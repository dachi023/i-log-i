// バリデーションスキーマ（将来的にzodなどを導入）
// 現時点ではシンプルなバリデーション関数を提供

export const LIMITS = {
  ENTRY_TITLE_MAX: 200,
  ENTRY_BODY_MAX: 50000,
  ANSWER_TEXT_MAX: 10000,
  MESSAGE_MAX: 5000,
  TAG_MAX: 50,
  TAGS_PER_ENTRY_MAX: 20,
  PERSON_TAG_NAME_MAX: 100,
  DISPLAY_NAME_MAX: 100,
  RELATIONSHIP_MAX: 50,
  UPLOAD_IMAGE_MAX_BYTES: 10 * 1024 * 1024, // 10MB
  UPLOAD_VIDEO_MAX_BYTES: 100 * 1024 * 1024, // 100MB
  UPLOAD_AUDIO_MAX_BYTES: 50 * 1024 * 1024, // 50MB
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_MAX: 100,
} as const;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUlid(id: string): boolean {
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id);
}
