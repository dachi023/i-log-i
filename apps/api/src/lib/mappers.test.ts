import { describe, expect, it } from "vitest";
import { type EntryRow, mapEntryRow } from "./mappers";

describe("mapEntryRow", () => {
  it("should convert snake_case row to camelCase Entry", () => {
    const row: EntryRow = {
      id: "01JQXK5V0G3M8N2P4R6T8W0Y1Z",
      body: "テスト記録",
      recorded_at: "2026-03-21T00:00:00.000Z",
      created_at: "2026-03-21T00:00:00.000Z",
      updated_at: "2026-03-21T00:00:00.000Z",
    };

    const entry = mapEntryRow(row);
    expect(entry).toEqual({
      id: "01JQXK5V0G3M8N2P4R6T8W0Y1Z",
      body: "テスト記録",
      recordedAt: "2026-03-21T00:00:00.000Z",
      createdAt: "2026-03-21T00:00:00.000Z",
      updatedAt: "2026-03-21T00:00:00.000Z",
    });
  });

  it("should handle null body", () => {
    const row: EntryRow = {
      id: "01JQXK5V0G3M8N2P4R6T8W0Y1Z",
      body: null,
      recorded_at: "2026-03-21T00:00:00.000Z",
      created_at: "2026-03-21T00:00:00.000Z",
      updated_at: "2026-03-21T00:00:00.000Z",
    };

    const entry = mapEntryRow(row);
    expect(entry.body).toBeNull();
  });
});
