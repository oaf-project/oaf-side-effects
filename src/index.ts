// tslint:disable: no-expression-statement
// tslint:disable: no-object-mutation
// tslint:disable: no-if-statement
// tslint:disable: no-console
// tslint:disable: interface-over-type-literal

/**
 * A CSS selector.
 */
export type Selector = string;

/**
 * A hash fragment.
 */
export type Hash = string;

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
 * @param hash the hash fragment, e.g. "#", "#top" or "#my-heading-id"
 */
export const elementFromHash = (hash: Hash): Element | undefined => {
  if (hash === null || hash === undefined) {
    return undefined;
  }
  switch (hash) {
    case "#":
      return (
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
  document.title = title;
  return;
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
      (window.innerHeight || document.documentElement.clientHeight) &&
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

const documentElement =
  document.documentElement || document.body.parentNode || document.body;

export const getScrollPosition = (): ScrollPosition => {
  // See https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX#Notes
  const x = window.scrollX || window.pageXOffset || documentElement.scrollLeft;
  const y = window.scrollY || window.pageYOffset || documentElement.scrollTop;

  return { x, y };
};

/**
 * Scrolls the window to the given scroll position.
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * @param scrollPosition the scroll position to scroll to
 * @param options controls how the scroll is executed
 */
export const setScrollPosition = (
  scrollPosition: ScrollPosition,
  scrollOptions?: ScrollOptions,
): void => {
  if (
    scrollOptions !== undefined &&
    typeof scrollOptions === "object" &&
    scrollOptions.behavior === "smooth"
  ) {
    try {
      window.scrollTo({
        behavior: scrollOptions.behavior,
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
  } else {
    // Use old form of scrollTo() (when we can) to maximize browser compatibility.
    window.scrollTo(scrollPosition.x, scrollPosition.y);
  }
};

const getScrollPositionRestorer = (): (() => Promise<void>) => {
  const scrollPosition = getScrollPosition();

  return () => {
    // See https://github.com/calvellido/focus-options-polyfill/blob/master/index.js
    // HACK: It seems that we have to call window.scrollTo() twice--once
    // immediately after focus and then again in a setTimeout()--to prevent
    // Firefox from bouncing around the page. TODO: Revisit this.
    setScrollPosition(scrollPosition);
    return new Promise(resolve => {
      setTimeout(() => {
        setScrollPosition(scrollPosition);
        resolve();
      });
    });
  };
};

const disableSmoothScroll = (): (() => void) => {
  // See https://caniuse.com/#search=css-scroll-behavior
  // See https://caniuse.com/#search=getcomputedstyle
  const scrollElements =
    typeof window.getComputedStyle === "function"
      ? [window.document.documentElement, window.document.body]
      : [];
  const smoothScrollElements = scrollElements
    .filter(
      e => e !== null && window.getComputedStyle(e).scrollBehavior === "smooth",
    )
    .map(e => ({ element: e, originalScrollBehavior: e.style.scrollBehavior }));
  smoothScrollElements.forEach(
    ({ element }) => (element.style.scrollBehavior = "auto"),
  );

  // Return a function that will put things back the way we found them.
  return () => {
    smoothScrollElements.forEach(
      ({ element, originalScrollBehavior }) =>
        (element.style.scrollBehavior = originalScrollBehavior),
    );
  };
};

/**
 * Executes a function that may (undesirably) change the window's scroll position
 * and then restores the window scroll position and scroll behavior.
 * @param funcWithScrollSideEffect a function to execute that may (undesirably) change the window's scroll position
 */
const withRestoreScrollPosition = async <T>(
  funcWithScrollSideEffect: () => T,
): Promise<T> => {
  const restoreScrollPosition = getScrollPositionRestorer();

  // Just in case `scroll-behavior: smooth` is set via CSS, set it to auto
  // temporarily to help ensure that the scrolling caused by
  // `funcWithScrollSideEffect` and `restoreScrollPosition` is imperceptible.
  // This is not required in Chrome but it is in Firefox and perhaps elsewhere.
  const restoreScrollBehavior = disableSmoothScroll();

  const result = funcWithScrollSideEffect();

  await restoreScrollPosition();

  // After we're done scrolling set scrollBehavior back to its original value.
  restoreScrollBehavior();

  return result;
};

/**
 * Focuses an element, setting `tabindex="-1"` if necessary.
 *
 * If you specify the preventScroll focus option (which has poor
 * browser support) this function will use a window.scrollTo()
 * hack to emulate the preventScroll option's behavior.
 *
 * See: https://developer.paciellogroup.com/blog/2014/08/using-the-tabindex-attribute/
 * See: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#Browser_compatibility
 * See: https://github.com/whatwg/html/issues/834
 * See: https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling/6610501
 * See: https://github.com/calvellido/focus-options-polyfill
 *
 * @param target the element to focus.
 * @param options focus options.
 */
export const focusElement = async (
  target: Target,
  options?: FocusOptions,
): Promise<boolean> => {
  const element = elementFromTarget(target);

  if (element === undefined) {
    console.warn(`Cannot focus element. Element [${target}] not found.`);
    return Promise.resolve(false);
  }

  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    console.warn(
      `Cannot focus element. Element [${target}] is not an HTMLElement or SVGElement.`,
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
      const blurListener = () => {
        element.removeAttribute("tabindex");
        element.removeEventListener("blur", blurListener);
      };
      element.addEventListener("blur", blurListener);
    }

    if (
      options !== undefined &&
      typeof options === "object" &&
      options.preventScroll === true
    ) {
      // preventScroll has poor browser support, so we restore scroll manually after setting focus.
      // TODO detect if browser supports preventScroll and avoid `withRestoreScrollPosition`
      // shenanigans if so.
      await withRestoreScrollPosition(() => {
        try {
          element.focus(options);
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
  } catch (e) {
    // Apparently trying to focus a disabled element in IE can throw.
    // See https://stackoverflow.com/a/1600194/2476884
    console.error(e);
    return false;
  }
};

/**
 * True if the user prefers reduced motion, false otherwise.
 */
export const prefersReducedMotion = () => {
  // See https://caniuse.com/#feat=matchmedia
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
};

/**
 * Scrolls an element into view.
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, smooth
 * scrolling behavior options passed to this function will be ignored.
 *
 * @param element the element to scroll into view
 * @param options controls how the scroll is executed
 */
export const scrollIntoView = (element: Element, options?: ScrollOptions) => {
  // TODO support ScrollIntoViewOptions instead of just ScrollOptions and
  // respect block and inline even when not smooth scrolling.
  if (prefersReducedMotion()) {
    element.scrollIntoView();
  } else if (
    options === undefined ||
    typeof options !== "object" ||
    options.behavior === "auto"
  ) {
    // Avoid passing anything to scrollIntoView() (when we can) to maximize browser compatibility.
    element.scrollIntoView();
  } else {
    if (element === document.documentElement || element === document.body) {
      // See https://github.com/iamdustan/smoothscroll/issues/138
      setScrollPosition({ x: 0, y: 0 }, options);
    } else {
      try {
        element.scrollIntoView(options);
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
 * @param target the element to scroll into view
 * @param options controls how the scroll is executed
 */
export const scrollIntoViewIfRequired = (
  target: Target,
  options?: ScrollOptions,
  inViewport?: (element: Element) => boolean,
): void => {
  const element = elementFromTarget(target);
  if (element !== undefined && !(inViewport || isInViewport)(element)) {
    scrollIntoView(element, options);
  }
};

/**
 * Focuses a specified element and then scrolls it (or another element) into view (if required).
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 */
export const focusAndScrollIntoViewIfRequired = async (
  focusTarget: Target,
  scrollIntoViewTarget: Target,
  focusOptions?: FocusOptions,
  scrollOptions?: ScrollOptions,
): Promise<boolean> => {
  const elementToFocus = elementFromTarget(focusTarget);
  const elementToScrollIntoView =
    elementFromTarget(scrollIntoViewTarget) || elementToFocus;

  // See https://css-tricks.com/smooth-scrolling-accessibility/
  // See https://github.com/whatwg/html/issues/834
  // See https://stackoverflow.com/questions/4963053/focus-to-input-without-scrolling/6610501

  // Focus the element for keyboard users and users of assistive technology.
  const result: boolean =
    elementToFocus !== undefined
      ? await focusElement(
          elementToFocus,
          // TODO: if scrollOptions doesn't specify smooth and
          // elementToFocus === elementToScrollIntoView then we can
          // avoid preventScroll shenanigans here.
          focusOptions || { preventScroll: true },
        )
      : false;

  if (elementToScrollIntoView !== undefined) {
    // For screen users, scroll the element into view.
    scrollIntoViewIfRequired(elementToScrollIntoView, scrollOptions);
  }

  return Promise.resolve(result);
};

/**
 * Resets focus and scroll position after a SPA page navigation.
 *
 * Will attempt to move focus to the focusTarget, primaryFocusTarget,
 * document element and finally document body, in that order. If any of
 * those elements do not exist or cannot be focused, will attempt to
 * focus the next fallback element.
 *
 * See: https://github.com/ReactTraining/react-router/issues/5210
 *
 * @param primaryFocusTarget a CSS selector for your primary focus target,
 * e.g. `[main h1]`.
 * @param focusTarget the element to focus, e.g. the element identified by
 * the hash fragment of the URL.
 */
export const resetFocus = async (
  primaryFocusTarget: Selector,
  focusTarget?: Target,
  focusOptions?: FocusOptions,
  scrollOptions?: ScrollOptions,
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

  for (const targetElement of targets) {
    if (targetElement instanceof Element) {
      try {
        const didFocus = await focusAndScrollIntoViewIfRequired(
          targetElement,
          targetElement,
          focusOptions,
          scrollOptions,
        );

        if (didFocus) {
          return true;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  return false;
};

const createAnnounceDiv = (announceDivId: string): HTMLDivElement => {
  const div = document.createElement("div");

  div.setAttribute("id", announceDivId);
  div.setAttribute("role", "status");
  div.setAttribute("aria-live", "polite");
  div.setAttribute("aria-atomic", "true");

  // As per Bootstrap's sr-only styles.
  // See: https://a11yproject.com/posts/how-to-hide-content/
  // See: https://hugogiraudel.com/2016/10/13/css-hide-and-seek/
  // See: https://getbootstrap.com/docs/4.3/getting-started/accessibility/#visually-hidden-content
  // See: https://github.com/twbs/bootstrap/blob/ff29c1224c20b8fcf2d1e7c28426470f1dc3e40d/scss/mixins/_screen-reader.scss#L6
  div.style.position = "absolute";
  div.style.width = "1px";
  div.style.height = "1px";
  div.style.padding = "0";
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
  announcementsDivId: string = "announcements",
  setMessageTimeout: number = 50,
  clearMessageTimeout: number = 500,
): void => {
  const announceDiv =
    document.getElementById(announcementsDivId) ||
    createAnnounceDiv(announcementsDivId);
  setTimeout(() => (announceDiv.innerText = message), setMessageTimeout);
  setTimeout(() => (announceDiv.innerText = ""), clearMessageTimeout);
};

/**
 * Focuses and scrolls into view the first invalid form element inside
 * a given form.
 *
 * For IE support you might want to use the closest() polyfill from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 *
 * @param formSelector a CSS selector that uniquely identifies the form to focus, e.g. `#search-form`.
 * @param invalidElementSelector the CSS selector that is used to identify invalid elements within a form, e.g. `[aria-invalid="true"]`.
 * @param formGroupSelector a CSS selector passed to the closest() method of an invalid form input that identifies the element
 *                          that contains both the form input and its label. This form group element will be scrolled into view
 *                          so that both the input and its label are visible.
 *
 * See https://webaim.org/techniques/formvalidation/
 */
export const focusInvalidForm = (
  formSelector: Selector,
  invalidElementSelector: Selector,
  formGroupSelector: Selector,
  focusOptions?: FocusOptions,
  scrollOptions?: ScrollOptions,
): Promise<boolean> => {
  const form = elementFromTarget(formSelector);

  if (form === undefined) {
    console.warn(
      `No form matching [${formSelector}] found in document. Users of keyboards, screen readers and other assistive technology will have a degraded experience.`,
    );
    return Promise.resolve(false);
  }

  const firstInvalidElement = elementFromTarget(invalidElementSelector, form);

  if (firstInvalidElement === undefined) {
    console.warn(
      `No invalid form element matching [${invalidElementSelector}] found inside form [${formSelector}]. Users of keyboards, screen readers and other assistive technology will have a degraded experience.`,
    );
    return Promise.resolve(false);
  }

  const formGroup =
    formGroupSelector !== undefined &&
    typeof firstInvalidElement.closest === "function"
      ? firstInvalidElement.closest(formGroupSelector)
      : null;

  return focusAndScrollIntoViewIfRequired(
    firstInvalidElement,
    formGroup || firstInvalidElement,
    focusOptions,
    scrollOptions,
  );
};
