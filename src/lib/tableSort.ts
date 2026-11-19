export type SortState<Key> = { key: Key; descending: boolean };
type SortValue = number | string | null | undefined;

const collator = new Intl.Collator("ru", { numeric: true, sensitivity: "base" });

export function nextSort<Key>(current: SortState<Key> | undefined, key: Key): SortState<Key> {
  return { key, descending: current?.key === key && !current.descending };
}

export function sortRows<Row>(rows: Row[], value: (row: Row) => SortValue, descending: boolean) {
  const direction = descending ? -1 : 1;
  return [...rows].sort((a, b) => {
    const first = value(a);
    const second = value(b);
    if (first == null) return second == null ? 0 : 1;
    if (second == null) return -1;
    const comparison =
      typeof first === "number" && typeof second === "number"
        ? first - second
        : collator.compare(String(first), String(second));
    return comparison * direction;
  });
}
