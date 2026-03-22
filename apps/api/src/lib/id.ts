const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function generateUlid(): string {
  const now = Date.now();
  let id = "";

  // Encode timestamp (10 chars, big-endian)
  let t = now;
  const timestampChars: string[] = [];
  for (let i = 0; i < 10; i++) {
    timestampChars.unshift(ENCODING[t % 32]);
    t = Math.floor(t / 32);
  }
  id = timestampChars.join("");

  // Encode randomness (16 chars)
  const random = new Uint8Array(10);
  crypto.getRandomValues(random);
  for (let i = 0; i < 10; i++) {
    const byte = random[i];
    id += ENCODING[(byte >> 3) & 31];
    if (id.length < 26) {
      id += ENCODING[((byte & 7) << 2) | ((random[Math.min(i + 1, 9)] >> 6) & 3)];
    }
  }

  return id.slice(0, 26);
}
