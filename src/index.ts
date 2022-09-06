/* eslint-disable functional/no-loop-statement */
/* eslint-disable no-case-declarations */
/* eslint-disable functional/immutable-data */
/* eslint-disable functional/functional-parameters */
/* eslint-disable functional/no-try-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-return-void */

// `ExcludeStrict` from https://github.com/pelotom/type-zoo
// Copyright (c) 2017 Thomas Crockett
// MIT License
/**
 * Exclude from `T` those types that are assignable to `U`, where `U` must exist in `T`.
 *
 * Similar to `Exclude` but requires the exclusion list to be composed of valid members of `T`.
 *
 * @see https://github.com/pelotom/type-zoo/issues/37
 */
export type ExcludeStrict<T, U extends T> = T extends U ? never : T;

/**
 * A CSS selector.
 */
export type Selector = string;

/**
 * A hash fragment, including the leading # character, e.g. "#", "#top" or "#my-heading-id"
 */
export type Hash = string;

/**
 * ARIA live region politeness values.
 * See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
 */
export type AriaLivePoliteness = "off" | "polite" | "assertive";

/**
 * Specifies an element that is the target of a side effect (e.g. scroll into view, focus). This is
 * either the element itself or a selector that will return the element when passed to querySelector().
 */
export type Target = Element | Selector;

/**
 * The scroll position as x and y coordinates.
 */
export type ScrollPosition = { readonly x: number; readonly y: number };

/**
 * Maps from a URL hash fragment to a target element.
 *
 * Supports "#", "#top" and element IDs. The empty string returns undefined.
 *
 * Useful for scrolling to the element referred to by the hash fragment
 * in a URL (which browsers do natively, but single page apps often don't).
 *
 * See https://github.com/rafrex/react-router-hash-link (only manages scroll, not focus)
 * See https://github.com/ReactTraining/react-router/issues/394
 * See https://www.w3.org/TR/html5/single-page.html#scroll-to-the-fragment
 *
 * @param hash the hash fragment, including the leading # character, e.g. "#", "#top" or "#my-heading-id"
 */
export const elementFromHash = (hash: Hash): Element | undefined => {
  if (typeof hash !== "string") {
    return undefined;
  }
  switch (hash) {
    case "#":
      return (
        // documentElement can in fact be undefined in some old browsers.
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
        document.documentElement || document.body.parentElement || document.body
      );
    case "":
      return undefined;
    default:
      const element = document.getElementById(hash.substring(1));
      if (element !== null) {
        return element;
      } else if (hash === "#top") {
        return (
          // documentElement can in fact be undefined in some old browsers.
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
          document.documentElement ||
          document.body.parentElement ||
          document.body
        );
      } else {
        return undefined;
      }
  }
};

/**
 * Set the document title.
 * See https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-title.html
 *
 * @param title The new document title.
 */
export const setTitle = (title: string): void => {
  if (typeof title !== "string" || title.trim() === "") {
    console.error(
      `Title [${title}] is invalid. See https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-title.html`,
    );
  }
  document.title = title;
};

/**
 * True if the specified element is within the viewport, false otherwise.
 * See https://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
 *
 * @param element the element to test
 */
export const isInViewport = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();

  // TODO: handle overflow-scroll in element's container?
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      // innerHeight can in fact be undefined in some old browsers.
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      (window.innerHeight || document.documentElement.clientHeight) &&
    // innerHeight can in fact be undefined in some old browsers.
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

const querySelector = (
  selectors: Selector,
  parent: ParentNode = document,
): Element | undefined => {
  try {
    const result = parent.querySelector(selectors);
    return result === null ? undefined : result;
  } catch {
    console.warn(`Syntax error in selector [${selectors}].`);
    return undefined;
  }
};

export const elementFromTarget = (
  target: Target,
  parent: ParentNode = document,
): Element | undefined => {
  return target instanceof Element ? target : querySelector(target, parent);
};

export const getScrollPosition = (): ScrollPosition => {
  // See https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX#Notes
  const documentElement =
    // documentElement can in fact be undefined in some old browsers.
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
    document.documentElement || document.body.parentNode || document.body;
  // scrollX can in fact be undefined in some old browsers.
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const x = window.scrollX || window.pageXOffset || documentElement.scrollLeft;
  // scrollY can in fact be undefined in some old browsers.
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const y = window.scrollY || window.pageYOffset || documentElement.scrollTop;

  return { x, y };
};

/**
 * True if the user prefers reduced motion, false otherwise.
 *
 * See https://css-tricks.com/introduction-reduced-motion-media-query/
 */
export const prefersReducedMotion = (): boolean => {
  // See https://caniuse.com/#feat=matchmedia
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
};

/**
 * Scrolls the window to the given scroll position.
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, the smoothScroll value will be ignored.
 *
 * @param scrollPosition the scroll position to scroll to
 * @param smoothScroll true for smooth scrolling, false otherwise
 */
export const setScrollPosition = (
  scrollPosition: ScrollPosition,
  smoothScroll = false,
): void => {
  if (!smoothScroll || prefersReducedMotion()) {
    // Use old form of scrollTo() (when we can) to maximize browser compatibility.
    window.scrollTo(scrollPosition.x, scrollPosition.y);
  } else {
    try {
      window.scrollTo({
        behavior: "smooth",
        left: scrollPosition.x,
        top: scrollPosition.y,
      });
    } catch {
      // If scrollTo with options throws, fall back on old form.
      // See https://github.com/Fyrd/caniuse/issues/1760
      // See https://github.com/frontarm/navi/issues/71
      // See https://github.com/frontarm/navi/pull/84/files
      window.scrollTo(scrollPosition.x, scrollPosition.y);
    }
  }
};

const getScrollPositionRestorer = (): (() => void) => {
  const scrollPosition = getScrollPosition();

  return () => {
    setScrollPosition(scrollPosition);
  };
};

/**
 * Executes a function that may (undesirably) change the window's scroll position
 * and then restores the window scroll position and scroll behavior.
 * @param funcWithScrollSideEffect a function to execute that may (undesirably) change the window's scroll position
 */
const withRestoreScrollPosition = <T>(funcWithScrollSideEffect: () => T): T => {
  const restoreScrollPosition = getScrollPositionRestorer();
  const result = funcWithScrollSideEffect();
  restoreScrollPosition();
  return result;
};

/**
 * Focuses an element, setting `tabindex="-1"` if necessary.
 *
 * @param target the element to focus.
 * @param preventScroll true if the browser should not scroll the target element into view, false otherwise.
 */
export const focusElement = async (
  target: Target,
  preventScroll = false,
): Promise<boolean> => {
  // See: https://developer.paciellogroup.com/blog/2014/08/using-the-tabindex-attribute/
  // See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#Browser_compatibility
  // See: https://github.com/whatwg/html/issues/834
  // See: https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling/6610501

  const element = elementFromTarget(target);

  if (element === undefined) {
    console.warn(
      // TODO fix this
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `Cannot focus element. Element [${target.toString()}] not found.`,
    );
    return Promise.resolve(false);
  }

  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    console.warn(
      // TODO fix this
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `Cannot focus element. Element [${target.toString()}] is not an HTMLElement or SVGElement.`,
    );
    return Promise.resolve(false);
  }

  try {
    // Set tabindex="-1" if necessary.
    // TODO avoid setting tabindex when we're confident we don't need to?
    if (!element.hasAttribute("tabindex")) {
      element.setAttribute("tabindex", "-1");
      // We remove tabindex after blur to avoid weird browser behavior
      // where a mouse click can activate elements with tabindex="-1".
      const blurListener = (): void => {
        element.removeAttribute("tabindex");
        element.removeEventListener("blur", blurListener);
      };
      element.addEventListener("blur", blurListener);
    }

    if (preventScroll) {
      // preventScroll has poor browser support, so we restore scroll manually after setting focus.
      // see https://caniuse.com/#feat=mdn-api_htmlelement_focus_preventscroll_option
      // TODO detect if browser supports preventScroll and avoid `withRestoreScrollPosition`
      // shenanigans if so.
      withRestoreScrollPosition(() => {
        try {
          element.focus({ preventScroll: true });
        } catch {
          // If focus() with options throws, fall back on calling focus() without any arguments.
          element.focus();
        }
      });
    } else {
      // Avoid passing anything to focus() (when we can) to maximize browser compatibility.
      element.focus();
    }

    return document.activeElement === element;
  } catch (e: unknown) {
    // Apparently trying to focus a disabled element in IE can throw.
    // See https://stackoverflow.com/a/1600194/2476884
    console.error(e);
    return false;
  }
};

/**
 * Scrolls an element into view.
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, the smoothScroll value will be ignored.
 *
 * @param element the element to scroll into view
 * @param smoothScroll true for smooth scrolling, false otherwise
 */
export const scrollIntoView = (
  element: Element,
  smoothScroll = false,
): void => {
  // TODO support ScrollIntoViewOptions and respect block and inline even when not smooth scrolling.

  // Scrolling to the document element or the body is problematic
  // for a few reasons so we just scroll to `0, 0` instead.
  // See e.g. https://github.com/iamdustan/smoothscroll/issues/138
  if (element === document.documentElement || element === document.body) {
    setScrollPosition({ x: 0, y: 0 }, smoothScroll);
  } else {
    if (!smoothScroll || prefersReducedMotion()) {
      // Avoid passing anything to scrollIntoView() (when we can) to maximize browser compatibility.
      element.scrollIntoView();
    } else {
      try {
        element.scrollIntoView({ behavior: "smooth" });
      } catch {
        // If scrollIntoView with options throws, fall back on no options.
        // See https://github.com/frontarm/navi/issues/71
        element.scrollIntoView();
      }
    }
  }
};

/**
 * Scrolls an element into view if it is not currently visible.
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, the smoothScroll value will be ignored.
 *
 * @param target the element to scroll into view
 * @param smoothScroll true for smooth scrolling, false otherwise
 */
export const scrollIntoViewIfRequired = (
  target: Target,
  smoothScroll = false,
  inViewport: typeof isInViewport = isInViewport,
): void => {
  const element = elementFromTarget(target);
  if (element !== undefined && !inViewport(element)) {
    scrollIntoView(element, smoothScroll);
  }
};

/**
 * Focuses a specified element and then scrolls it (or another element) into view (if required).
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, the smoothScroll value will be ignored.
 *
 * @param focusTarget the element to focus
 * @param scrollIntoViewTarget the element to scroll into view
 * @param smoothScroll true for smooth scrolling, false otherwise
 */
export const focusAndScrollIntoViewIfRequired = async (
  focusTarget: Target,
  scrollIntoViewTarget: Target,
  smoothScroll = false,
): Promise<boolean> => {
  const elementToFocus = elementFromTarget(focusTarget);
  const elementToScrollIntoView =
    elementFromTarget(scrollIntoViewTarget) ?? elementToFocus;

  // See https://css-tricks.com/smooth-scrolling-accessibility/
  // See https://github.com/whatwg/html/issues/834
  // See https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling/6610501

  // If we're not smooth scrolling and
  // elementToFocus === elementToScrollIntoView then we can
  // avoid preventScroll shenanigans.
  const preventScroll =
    smoothScroll || elementToFocus !== elementToScrollIntoView;

  // Focus the element for keyboard users and users of assistive technology.
  const result =
    elementToFocus !== undefined &&
    (await focusElement(elementToFocus, preventScroll));

  if (elementToScrollIntoView !== undefined) {
    // For screen users, scroll the element into view.
    scrollIntoViewIfRequired(elementToScrollIntoView, smoothScroll);
  }

  return result;
};

/**
 * Resets focus and scroll position after a SPA page navigation.
 *
 * Will attempt to move focus to the focusTarget, primaryFocusTarget,
 * document element and finally document body, in that order. If any of
 * those elements do not exist or cannot be focused, will attempt to
 * focus the next fallback element.
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, the smoothScroll value will be ignored.
 *
 * See: https://github.com/ReactTraining/react-router/issues/5210
 *
 * @param primaryFocusTarget a CSS selector for your primary focus target,
 * e.g. `main h1`.
 * @param focusTarget the element to focus, e.g. the element identified by
 * the hash fragment of the URL.
 * @param smoothScroll true for smooth scrolling, false otherwise
 */
export const resetFocus = async (
  primaryFocusTarget: Selector,
  focusTarget?: Target,
  smoothScroll = false,
): Promise<boolean> => {
  const elementToFocus =
    focusTarget !== undefined ? elementFromTarget(focusTarget) : undefined;
  const primaryFocusElement = elementFromTarget(primaryFocusTarget);
  const targets: ReadonlyArray<Element | undefined> = [
    elementToFocus,
    primaryFocusElement,
    document.documentElement,
    document.body,
  ];

  // tslint:disable-next-line: no-loop-statement
  for (const targetElement of targets) {
    if (targetElement instanceof Element) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const didFocus = await focusAndScrollIntoViewIfRequired(
          targetElement,
          targetElement,
          smoothScroll,
        );

        if (didFocus) {
          return true;
        }
      } catch (e: unknown) {
        console.error(e);
      }
    }
  }

  return false;
};

const createAnnounceDiv = (
  id: string,
  politeness: ExcludeStrict<AriaLivePoliteness, "off">,
): HTMLDivElement => {
  const div = document.createElement("div");

  div.setAttribute("id", id);
  div.setAttribute("role", "status");
  div.setAttribute("aria-live", politeness);
  div.setAttribute("aria-atomic", "true");

  // As per Bootstrap's visually-hidden styles.
  // See: https://a11yproject.com/posts/how-to-hide-content/
  // See: https://hugogiraudel.com/2016/10/13/css-hide-and-seek/
  // See: https://github.com/twbs/bootstrap/blob/1df098361cac04217d6a464c80e890c4335ecb5c/scss/mixins/_visually-hidden.scss#L8-L18
  div.style.position = "absolute";
  div.style.width = "1px";
  div.style.height = "1px";
  div.style.padding = "0";
  div.style.margin = "-1px";
  div.style.overflow = "hidden";
  div.style.clip = "rect(0, 0, 0, 0)";
  div.style.whiteSpace = "nowrap";
  div.style.border = "0";

  document.body.appendChild(div);
  return div;
};

/**
 * Make an announcement to screen reader users. Useful for page navigation events.
 *
 * See https://almerosteyn.com/2017/03/accessible-react-navigation
 * See https://getbootstrap.com/docs/4.3/utilities/screen-readers/
 * See https://github.com/twbs/bootstrap/blob/ff29c1224c20b8fcf2d1e7c28426470f1dc3e40d/scss/mixins/_screen-reader.scss#L6
 *
 * @param message the message to announce to screen reader users, e.g. "navigated to about page".
 * @param announcementsDivId a DOM ID of the visually hidden announcements element, e.g. "announcements".
 */
export const announce = (
  message: string,
  announcementsDivId = "announcements",
  setMessageTimeout = 50,
  clearMessageTimeout = 500,
  politeness: ExcludeStrict<AriaLivePoliteness, "off"> = "polite",
): Promise<unknown> => {
  const announceDiv =
    document.getElementById(announcementsDivId) ??
    createAnnounceDiv(announcementsDivId, politeness);
  const p1 = new Promise((resolve) => {
    setTimeout(() => {
      announceDiv.innerText = message;
      resolve(undefined);
    }, setMessageTimeout);
  });

  const p2 = new Promise((resolve) => {
    setTimeout(() => {
      announceDiv.innerText = "";
      resolve(undefined);
    }, clearMessageTimeout);
  });

  return Promise.all([p1, p2]);
};

/* eslint-disable sonarjs/cognitive-complexity */

/**
 * Hide the on-screen keyboard on touch devices like iOS and Android.
 *
 * It's useful to do this after a form submission that doesn't navigate away from the
 * current page but does update some part of the current page (e.g. dynamically updated
 * search results). If you weren't to do this the user might not be shown any feedback
 * in response to their action (form submission), because it is obscured by the keyboard.
 *
 * To hide the keyboard we temporarily set the active input or textarea to readonly and
 * disabled. To avoid a flash of readonly/disabled styles (often a gray background) you
 * can hook into the [data-oaf-keyboard-hack] html attribute. For example:
 *
 * ```
 *  // Readonly/disabled styles shouldn't be applied when this attribute is present.
 *  [data-oaf-keyboard-hack] {
 *    background-color: $input-bg !important;
 *  }
 * ```
 *
 * Note that lots of people simply `blur()` the focused input to achieve this result
 * but doing that is hostile to keyboard users and users of other AT.
 *
 * Do you need to use this?
 *
 * 1. If your form submission triggers a full page reload, you don't need this.
 * 2. If your form submission explicitly moves focus to some other element, you
 * don't need this. For example you might move focus to some new content that
 * was loaded as a result of the form submission or to a loading message.
 * 3. If your form submission leaves focus where it is, you probably want this.
 */
export const hideOnscreenKeyboard = (): Promise<void> => {
  // TODO: use inputmode="none"?

  const activeElement = document.activeElement;
  const inputType =
    activeElement instanceof HTMLInputElement
      ? activeElement.getAttribute("type")
      : undefined;

  if (
    activeElement !== null &&
    activeElement instanceof HTMLElement &&
    // Don't bother with input types that we know don't trigger an OSK.
    inputType !== "checkbox" &&
    inputType !== "radio" &&
    inputType !== "submit" &&
    inputType !== "reset" &&
    inputType !== "button"
  ) {
    // Blur the active element to dismiss the on-screen keyboard.
    activeElement.blur();

    // Set an attribute that allows users to override readonly/disabled styles via CSS.
    // This input will be readonly/disabled for only a fraction of a second and we
    // want to avoid the flash of readonly/disabled styles.
    activeElement.setAttribute("data-oaf-keyboard-hack", "true");

    // Some older Android browsers need extra encouragement.
    // See https://stackoverflow.com/a/11160055/2476884
    const originalReadonly = activeElement.getAttribute("readonly");
    const originalDisabled = activeElement.getAttribute("disabled");

    activeElement.setAttribute("readonly", "true");
    if (activeElement instanceof HTMLTextAreaElement) {
      activeElement.setAttribute("disabled", "true");
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Put things back the way we found them.
        originalReadonly !== null
          ? activeElement.setAttribute("readonly", originalReadonly)
          : activeElement.removeAttribute("readonly");

        if (activeElement instanceof HTMLTextAreaElement) {
          originalDisabled !== null
            ? activeElement.setAttribute("disabled", originalDisabled)
            : activeElement.removeAttribute("disabled");
        }

        activeElement.removeAttribute("data-oaf-keyboard-hack");

        // Restore focus back to where it was. Lots of people forget to do this.
        // Note that programmatically calling focus() will not trigger the
        // on-screen keyboard to reemerge.
        activeElement.focus();

        resolve();
      });
    });
  } else {
    return Promise.resolve();
  }
};

/* eslint-enable sonarjs/cognitive-complexity */

/**
 * Like `closest()` but stops ascending the ancestor tree once it hits the specified form element.
 */
export const closestInsideForm = (
  element: Element,
  selector: Selector,
  form: Element,
): Element | undefined => {
  if (element === form || element.parentElement === null) {
    return undefined;
  } else if (element.matches(selector)) {
    return element;
  } else {
    return closestInsideForm(element.parentElement, selector, form);
  }
};

/**
 * Focuses and scrolls into view the first invalid form element inside
 * a given form. Attempts to hide the onscreen keyboard on touch devices so that
 * the validation message near the first invalid form element is visible on screen.
 *
 * Call this function after you have validated a form and identified errors.
 *
 * See https://webaim.org/techniques/formvalidation/
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, the smoothScroll value will be ignored.
 *
 * For IE support you might want to use the closest() polyfill from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 *
 * @param formTarget the form element to focus or a CSS selector that uniquely identifies the form to focus, e.g. `#search-form`.
 * @param invalidElementSelector the CSS selector that is used to identify invalid elements within a form, e.g. `[aria-invalid="true"]`.
 * @param elementWrapperSelector the CSS selector that matches the "wrapper" element--the closest ancestor of the form input--that contains
 *                               both the form input and its label.
 *                               This wrapper element will be scrolled into view so that both the invalid input and its label are visible.
 * @param globalFormErrorSelector the CSS selector that matches the "global" form error, i.e. an element at the top of the form that contains
 *                                an error message that isn't specific to a any given form input.
 * @param smoothScroll true for smooth scrolling, false otherwise
 */
export const focusInvalidForm = async (
  formTarget: Target,
  invalidElementSelector: Selector,
  elementWrapperSelector: Selector | undefined,
  globalFormErrorSelector: Selector | undefined,
  smoothScroll = false,
): Promise<boolean> => {
  const form = elementFromTarget(formTarget);

  if (form === undefined) {
    console.warn(
      // TODO fix this
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `No form matching [${formTarget.toString()}] found in document. Users of keyboards, screen readers and other assistive technology will have a degraded experience.`,
    );
    return Promise.resolve(false);
  }

  const firstInvalidElement = elementFromTarget(invalidElementSelector, form);

  // Fall back on globalFormErrorElement if no firstInvalidElement found.
  const globalFormErrorElement =
    firstInvalidElement === undefined && globalFormErrorSelector !== undefined
      ? elementFromTarget(globalFormErrorSelector, form)
      : undefined;

  const elementToFocus = firstInvalidElement ?? globalFormErrorElement;

  if (elementToFocus === undefined) {
    // TODO: In this case should we focus and scroll to the form itself?
    console.warn(
      // TODO fix this
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `No invalid form element matching [${invalidElementSelector}] found inside form [${formTarget.toString()}]. Users of keyboards, screen readers and other assistive technology will have a degraded experience.`,
    );
    return Promise.resolve(false);
  }

  // There's a common pitfall where focusing the invalid input scrolls the viewport back up
  // only as far as the input, but the label remains just offscreen above the input (assuming the label
  // is above the input and not beside it). At this point we're commonly below the input because
  // we're at the bottom of the form where the submit button is, so this scenario is reasonably common.
  // To avoid this we use a wrapper element that contains both the input and its label. We scroll the wrapper
  // into view so the label is visible and then move focus to the input. If there is no wrapper we just
  // scroll to the input itself.
  const firstInvalidElementWrapper =
    elementWrapperSelector !== undefined &&
    firstInvalidElement !== undefined &&
    typeof firstInvalidElement.matches === "function"
      ? closestInsideForm(firstInvalidElement, elementWrapperSelector, form)
      : undefined;

  // If the invalid element that we're about to focus _already_ has focus, then the onscreen
  // keyboard is likely to remain visible, which risks obscuring the validation message displayed
  // near the invalid input. We try to trick the browser into hiding the onscreen keyboard to
  // avoid this situation and give the validation message the best chance of being visible.
  await hideOnscreenKeyboard();

  return focusAndScrollIntoViewIfRequired(
    elementToFocus,
    firstInvalidElementWrapper ?? elementToFocus,
    smoothScroll,
  );
};
