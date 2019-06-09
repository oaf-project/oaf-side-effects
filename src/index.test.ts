import {
  announce,
  elementFromHash,
  elementFromTarget,
  focusAndScrollIntoViewIfRequired,
  focusInvalidForm,
  Hash,
  resetFocus,
  scrollIntoView,
  setTitle,
} from ".";

// tslint:disable-next-line: no-commented-code
// tslint:disable: no-expression-statement
// tslint:disable: no-object-mutation
// tslint:disable: readonly-array
// tslint:disable: no-duplicate-string

describe("elementFromHash", () => {
  test("finds element by ID", () => {
    const div = window.document.createElement("div");
    div.id = "test-id";
    document.body.appendChild(div);
    expect(elementFromHash("#test-id")).toBe(div);
  });

  const elementFromHashTable: ReadonlyArray<[Hash, HTMLElement | undefined]> = [
    ["#", window.document.documentElement],
    ["#top", window.document.documentElement],
    ["", undefined],
    ["a", undefined],
    [(null as unknown) as Hash, undefined],
    [(undefined as unknown) as Hash, undefined],
    [(true as unknown) as Hash, undefined],
    [(1 as unknown) as Hash, undefined],
    [({} as unknown) as Hash, undefined],
    [([] as unknown) as Hash, undefined],
  ];

  describe.each(elementFromHashTable)(
    "returns expected element",
    (hash, expected) => {
      test(`for hash ${JSON.stringify(hash)}`, () => {
        expect(elementFromHash(hash)).toBe(expected);
      });
    },
  );
});

describe("elementFromTarget", () => {
  test("returns undefined for malformed CSS query", () => {
    expect(elementFromTarget("a[")).toBeUndefined();
  });

  test("returns element for valid CSS query", () => {
    expect(elementFromTarget("body")).toBe(window.document.body);
  });

  test("returns element for element", () => {
    expect(elementFromTarget(window.document.body)).toBe(window.document.body);
  });
});

describe("announce", () => {
  test("doesn't throw", async () => {
    await announce("hello");
  });
});

describe("resetFocus", () => {
  test("sets focus to the primaryFocusTarget", async () => {
    await resetFocus("body");
    expect(window.document.activeElement).toBe(window.document.body);
  });

  test("sets focus to the focusTarget", async () => {
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);
    await resetFocus("body", div);
    expect(window.document.activeElement).toBe(div);
  });
});

describe("focusAndScrollIntoViewIfRequired", () => {
  test("doesn't throw when focus and scroll elements are the same", async () => {
    await focusAndScrollIntoViewIfRequired("body", "body");
  });

  test("doesn't throw when focus and scroll elements are different", async () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const p = document.createElement("p");
    document.body.appendChild(p);

    // tslint:disable-next-line: no-empty
    window.scrollTo = () => {};

    await focusAndScrollIntoViewIfRequired(div, p);
  });

  test("doesn't throw when smooth scrolling", async () => {
    // tslint:disable-next-line: no-empty
    window.scrollTo = () => {};

    await focusAndScrollIntoViewIfRequired("body", "body", true);
  });
});

describe("focusInvalidForm", () => {
  test("doesn't throw if form doesn't exist", async () => {
    await focusInvalidForm("form", "[aria-invalid=true]", ".form-group");
  });

  test("doesn't throw if invalid element doesn't exist", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    await focusInvalidForm(form, "[aria-invalid=true]", ".form-group");
  });

  test("focuses an invalid element", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);

    const invalidInput = document.createElement("input");
    invalidInput.setAttribute("aria-invalid", "true");
    form.appendChild(invalidInput);

    await focusInvalidForm(form, "[aria-invalid=true]", ".form-group");

    expect(document.activeElement).toBe(invalidInput);
  });

  test("doesn't throw if closest() is undefined", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);

    const invalidInput = document.createElement("input");
    invalidInput.setAttribute("aria-invalid", "true");
    form.appendChild(invalidInput);

    // @ts-ignore
    invalidInput.closest = undefined;

    await focusInvalidForm(form, "[aria-invalid=true]", ".form-group");
  });
});

describe("setTitle", () => {
  const titles: ReadonlyArray<[string, string]> = [
    ["hello", "hello"],
    ["", ""],
    [(null as unknown) as string, "null"],
    [(undefined as unknown) as string, "undefined"],
    [(true as unknown) as string, "true"],
    [(1 as unknown) as string, "1"],
    [({} as unknown) as string, "[object Object]"],
    [([] as unknown) as string, ""],
  ];

  describe.each(titles)("sets the document title", (title, expected) => {
    test(`for title ${JSON.stringify(title)}`, () => {
      setTitle(title);
      expect(document.title).toBe(expected);
    });
  });
});

describe("scrollIntoView", () => {
  test("doesn't throw", () => {
    // tslint:disable-next-line: no-empty
    Element.prototype.scrollIntoView = () => {};

    const div = document.createElement("div");
    document.body.appendChild(div);

    scrollIntoView(window.document.body);
    scrollIntoView(window.document.documentElement);
    scrollIntoView(div);
    scrollIntoView(div, true);
  });
});
