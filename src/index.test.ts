import { elementFromHash } from ".";

// tslint:disable: no-expression-statement

test("elementFromHash", () => {
  expect(elementFromHash("#")).toBe(window.document.documentElement);
  expect(elementFromHash("#top")).toBe(window.document.documentElement);
  expect(elementFromHash("")).toBeUndefined();
  expect(elementFromHash(null as any)).toBeUndefined();
  expect(elementFromHash(undefined as any)).toBeUndefined();
  expect(elementFromHash("a")).toBeUndefined();
});
