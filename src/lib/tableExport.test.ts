import assert from "node:assert/strict";
import { test } from "node:test";
import { csvCell } from "./tableExport.ts";

test("CSV escapes quotes and preserves delimiters and line breaks inside a cell", () => {
  assert.equal(csvCell('a;"b"\nc'), '"a;""b""\nc"');
  assert.equal(csvCell(null), '""');
});

test("CSV neutralizes formula-like text while keeping negative numbers numeric", () => {
  assert.equal(csvCell(" =1+1"), '"\' =1+1"');
  assert.equal(csvCell("-12"), '"\'-12"');
  assert.equal(csvCell(-12), '"-12"');
});
