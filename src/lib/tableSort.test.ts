import assert from "node:assert/strict";
import { test } from "node:test";
import { nextSort, sortRows } from "./tableSort.ts";

test("sorts raw numbers and natural text without mutating the source", () => {
  const data = [
    { id: 2, name: "Груз 12" },
    { id: 11, name: "Груз 2" },
  ];
  assert.deepEqual(
    sortRows(data, (row) => row.id, true).map((row) => row.id),
    [11, 2],
  );
  assert.deepEqual(
    sortRows(data, (row) => row.name, false).map((row) => row.id),
    [11, 2],
  );
  assert.deepEqual(
    data.map((row) => row.id),
    [2, 11],
  );
});

test("keeps empty values last and toggles only the active column", () => {
  assert.deepEqual(
    sortRows([null, 1, 2], (value) => value, true),
    [2, 1, null],
  );
  const first = nextSort<string>(undefined, "date");
  assert.deepEqual(nextSort(first, "date"), { key: "date", descending: true });
  assert.deepEqual(nextSort(first, "weight"), { key: "weight", descending: false });
});
