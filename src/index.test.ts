/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable jest/no-identical-title */
/* eslint-disable functional/no-return-void */
/* eslint-disable functional/no-throw-statement */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable @typescript-eslint/unbound-method */

import {
  announce,
  closestInsideForm,
  elementFromHash,
  elementFromTarget,
  focusAndScrollIntoViewIfRequired,
  focusElement,
  focusInvalidForm,
  Hash,
  prefersReducedMotion,
  resetFocus,
  scrollIntoView,
  scrollIntoViewIfRequired,
  setScrollPosition,
  setTitle,
  hideOnscreenKeyboard,
} from ".";

// Keep references to the original values of these functions.
const documentElementFocus = window.document.documentElement.focus;
const bodyFocus = window.document.body.focus;
const matchMedia = window.matchMedia;
const getComputedStyle = window.getComputedStyle;

beforeEach(() => {
  // Clear previous test's DOM.
  window.document.body.innerHTML = "";

  // js-dom doesn't implement scrollIntoView
  Element.prototype.scrollIntoView = () => {};

  // Restore these functions because some tests mess with them.
  window.document.documentElement.focus = documentElementFocus;
  window.document.body.focus = bodyFocus;
  window.matchMedia = matchMedia;
  window.getComputedStyle = getComputedStyle;
});

describe("elementFromHash", () => {
  test("finds element by ID", () => {
    const div = window.document.createElement("div");
    div.id = "test-id";
    document.body.appendChild(div);
    expect(elementFromHash("#test-id")).toBe(div);
  });

  const elementFromHashTable: ReadonlyArray<
    readonly [Hash, HTMLElement | undefined]
  > = [
    ["#", window.document.documentElement],
    ["#top", window.document.documentElement],
    ["", undefined],
    ["a", undefined],
    [null as unknown as Hash, undefined],
    [undefined as unknown as Hash, undefined],
    [true as unknown as Hash, undefined],
    [1 as unknown as Hash, undefined],
    [{} as unknown as Hash, undefined],
    [[] as unknown as Hash, undefined],
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
    expect(document.querySelector("#announcements")).not.toBeNull();
    expect(document.querySelector("#announcements")!.getAttribute("role")).toBe(
      "status",
    );
    expect(
      document.querySelector("#announcements")!.getAttribute("aria-live"),
    ).toBe("polite");
    expect(
      document.querySelector("#announcements")!.getAttribute("aria-atomic"),
    ).toBe("true");
    expect(
      document.querySelector("#announcements")!.getAttribute("style"),
    ).toBe(
      "position: absolute; width: 1px; height: 1px; padding: 0px; margin: -1px; overflow: hidden; clip: rect(0px, 0px, 0px, 0px); white-space: nowrap; border: 0px;",
    );
  });
});

describe("resetFocus", () => {
  test("sets focus to the primaryFocusTarget", async () => {
    const result = await resetFocus("body");
    expect(result).toBe(true);
    expect(window.document.activeElement).toBe(window.document.body);
  });

  test("sets focus to the focusTarget", async () => {
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);
    const result = await resetFocus("body", div);
    expect(result).toBe(true);
    expect(window.document.activeElement).toBe(div);
  });

  test("returns false if nothing could be focused", async () => {
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);
    const p = window.document.createElement("p");
    window.document.body.appendChild(p);

    div.focus = () => {
      throw "Expected error";
    };
    p.focus = () => {
      throw "Expected error";
    };
    window.document.documentElement.focus = () => {
      throw "Expected error";
    };
    window.document.body.focus = () => {
      throw "Expected error";
    };

    const result = await resetFocus("div", "p");

    expect(result).toBe(false);
  });
});

describe("focusAndScrollIntoViewIfRequired", () => {
  test("doesn't throw when focus and scroll elements are the same", async () => {
    await focusAndScrollIntoViewIfRequired("body", "body");
    expect(document.activeElement).toBe(document.body);
  });

  test("doesn't throw when focus element doesn't exist", async () => {
    const result = await focusAndScrollIntoViewIfRequired(
      "does-not-exist",
      "body",
    );
    expect(result).toBe(false);
  });

  test("doesn't throw when scroll element doesn't exist", async () => {
    await focusAndScrollIntoViewIfRequired("body", "does-not-exist");
    expect(document.activeElement).toBe(document.body);
  });

  test("doesn't throw when focus and scroll elements are different", async () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const p = document.createElement("p");
    document.body.appendChild(p);

    await focusAndScrollIntoViewIfRequired(div, p);
    expect(document.activeElement).toBe(div);
  });

  test("doesn't throw when smooth scrolling", async () => {
    await focusAndScrollIntoViewIfRequired("body", "body", true);
    expect(document.activeElement).toBe(document.body);
  });
});

describe("focusInvalidForm", () => {
  test("doesn't throw if form doesn't exist", async () => {
    const result = await focusInvalidForm(
      "form",
      "[aria-invalid=true]",
      ".form-group",
      "[role=alert]",
    );
    expect(result).toBe(false);
  });

  test("doesn't throw if invalid element doesn't exist", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    const result = await focusInvalidForm(
      form,
      "[aria-invalid=true]",
      ".form-group",
      "[role=alert]",
    );
    expect(result).toBe(false);
  });

  test("focuses an invalid element", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);

    const invalidInput = document.createElement("input");
    invalidInput.setAttribute("aria-invalid", "true");
    form.appendChild(invalidInput);

    const result = await focusInvalidForm(
      form,
      "[aria-invalid=true]",
      ".form-group",
      "[role=alert]",
    );

    expect(result).toBe(true);
    expect(document.activeElement).toBe(invalidInput);
  });

  test("focuses a global form error", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);

    const globalError = document.createElement("div");
    globalError.setAttribute("role", "alert");
    form.appendChild(globalError);

    const result = await focusInvalidForm(
      form,
      "[aria-invalid=true]",
      ".form-group",
      "[role=alert]",
    );

    expect(result).toBe(true);
    expect(document.activeElement).toBe(globalError);
  });

  test("doesn't throw if closest() is undefined", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);

    const invalidInput = document.createElement("input");
    invalidInput.setAttribute("aria-invalid", "true");
    form.appendChild(invalidInput);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    invalidInput.closest = undefined;

    const result = await focusInvalidForm(
      form,
      "[aria-invalid=true]",
      ".form-group",
      "[role=alert]",
    );

    expect(result).toBe(true);
  });
});

describe("setTitle", () => {
  const titles: ReadonlyArray<readonly [string, string]> = [
    ["hello", "hello"],
    ["", ""],
    [null as unknown as string, "null"],
    [undefined as unknown as string, "undefined"],
    [true as unknown as string, "true"],
    [1 as unknown as string, "1"],
    [{} as unknown as string, "[object Object]"],
    [[] as unknown as string, ""],
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
    const div = document.createElement("div");
    document.body.appendChild(div);

    scrollIntoView(window.document.body);
    scrollIntoView(window.document.documentElement);
    scrollIntoView(div);
    scrollIntoView(div, true);
  });

  test("handles exception from scrollIntoView when smooth scrolling", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    div.scrollIntoView = (options?: ScrollIntoViewOptions) => {
      // eslint-disable-next-line functional/no-conditional-statement
      if (options !== undefined && options.behavior === "smooth") {
        throw new Error("");
      }
    };

    scrollIntoView(div, true);
  });
});

describe("scrollIntoView", () => {
  test("doesn't throw when using smooth scrolling", () => {
    setScrollPosition({ x: 0, y: 0 }, true);
  });

  test("handles exception from scrollTo when smooth scrolling", () => {
    const scrollTo = (options?: ScrollToOptions): void => {
      // eslint-disable-next-line functional/no-conditional-statement
      if (options !== undefined && options.behavior === "smooth") {
        throw new Error("");
      }
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.scrollTo = scrollTo;

    setScrollPosition({ x: 0, y: 0 }, true);
  });
});

describe("prefersReducedMotion", () => {
  test("doesn't throw when window.matchMedia is undefined", () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  test("calls window.matchMedia appropriately", () => {
    window.matchMedia = () => ({ matches: true } as MediaQueryList);
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe("scrollIntoViewIfRequired", () => {
  test("doesn't throw", () => {
    scrollIntoViewIfRequired(document.documentElement);
  });

  test("doesn't throw if smooth scrolling", () => {
    scrollIntoViewIfRequired(document.documentElement, true);
  });

  test("doesn't throw when element is not in viewport", () => {
    scrollIntoViewIfRequired(document.documentElement, false, () => false);
  });
});

describe("focusElement", () => {
  test("returns false when selector doesn't exist", async () => {
    const result = await focusElement("does-not-exist");
    expect(result).toBe(false);
  });

  test("focuses the specified element", async () => {
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);

    const result = await focusElement(div, true);

    expect(result).toBe(true);
    expect(window.document.activeElement).toBe(div);
    expect(div.getAttribute("tabindex")).toBe("-1");

    div.blur();
    expect(div.getAttribute("tabindex")).toBeNull();
  });

  test("leaves tabindex alone if already set", async () => {
    const div = window.document.createElement("div");
    div.setAttribute("tabindex", "0");
    window.document.body.appendChild(div);

    const result = await focusElement(div, true);

    expect(result).toBe(true);
    expect(window.document.activeElement).toBe(div);
    expect(div.getAttribute("tabindex")).toBe("0");

    div.blur();
    expect(div.getAttribute("tabindex")).toBe("0");
  });

  test("handles exceptions from focus() when preventScroll is true", async () => {
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);

    const originalFocus = div.focus;
    div.focus = (options) => {
      // eslint-disable-next-line functional/no-conditional-statement
      if (options !== undefined && options.preventScroll === true) {
        throw new Error("");
      } else {
        originalFocus.call(div);
      }
    };

    const result = await focusElement(div, true);

    expect(result).toBe(true);
    expect(window.document.activeElement).toBe(div);
  });

  test("returns false when focus() throws", async () => {
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);

    div.focus = () => {
      throw "Expected error";
    };

    const result = await focusElement(div, true);

    expect(result).toBe(false);
    expect(window.document.activeElement).not.toBe(div);
  });

  test("doesn't throw when window.getComputedStyle is undefined", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.getComputedStyle = undefined;

    const result = await focusElement(document.body, true);
    expect(result).toBe(true);
  });

  test("doesn't throw when smooth scroll set via CSS", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.getComputedStyle = () => ({ scrollBehavior: "smooth" });

    const result = await focusElement(document.body, true);
    expect(result).toBe(true);
  });
});

describe("closestInsideForm", () => {
  test("matches wrapper element inside form", () => {
    const form = window.document.createElement("form");
    const div = window.document.createElement("div");
    const input = window.document.createElement("input");
    form.appendChild(div);
    div.appendChild(input);
    window.document.body.appendChild(form);

    expect(closestInsideForm(input, "div", form)).toBe(div);
  });

  test("stops at form even when match exists above form", () => {
    const div = window.document.createElement("div");
    const form = window.document.createElement("form");
    const input = window.document.createElement("input");
    form.appendChild(input);
    div.appendChild(form);
    window.document.body.appendChild(div);

    expect(closestInsideForm(input, "div", form)).toBeUndefined();
  });
});

describe("hideOnscreenKeyboard", () => {
  test("restores focus to active input", async () => {
    const form = window.document.createElement("form");
    const div = window.document.createElement("div");
    const input = window.document.createElement("input");
    form.appendChild(div);
    div.appendChild(input);
    window.document.body.appendChild(form);
    input.focus();

    expect(document.activeElement).toBe(input);

    await hideOnscreenKeyboard();

    expect(document.activeElement).toBe(input);
  });

  test("restores focus to active text area", async () => {
    const form = window.document.createElement("form");
    const div = window.document.createElement("div");
    const textarea = window.document.createElement("textarea");
    form.appendChild(div);
    div.appendChild(textarea);
    window.document.body.appendChild(form);
    textarea.focus();

    expect(document.activeElement).toBe(textarea);

    await hideOnscreenKeyboard();

    expect(document.activeElement).toBe(textarea);
  });
});
