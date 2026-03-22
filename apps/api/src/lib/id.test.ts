import { isValidUlid } from "@i-log-i/validation";
import { describe, expect, it } from "vitest";
import { generateUlid } from "./id";

describe("generateUlid", () => {
  it("should generate a 26 character string", () => {
    const id = generateUlid();
    expect(id).toHaveLength(26);
  });

  it("should match ULID format", () => {
    const id = generateUlid();
    expect(isValidUlid(id)).toBe(true);
  });

  it("should generate unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUlid()));
    expect(ids.size).toBe(100);
  });

  it("should be lexicographically sortable by time", () => {
    const id1 = generateUlid();
    // タイムスタンプが変わるように少し待つ
    const id2 = generateUlid();
    // 同一ミリ秒でもランダム部分で異なるが、少なくともタイムスタンプ部(先頭10文字)は同じか後
    expect(id2.slice(0, 10) >= id1.slice(0, 10)).toBe(true);
  });
});
