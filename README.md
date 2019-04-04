[![Build Status](https://travis-ci.org/danielnixon/oaf-side-effects.svg?branch=master)](https://travis-ci.org/danielnixon/oaf-side-effects)
[![Known Vulnerabilities](https://snyk.io/test/github/danielnixon/oaf-side-effects/badge.svg?targetFile=package.json)](https://snyk.io/test/github/danielnixon/oaf-side-effects?targetFile=package.json)

# Oaf Side Effects

A collection of DOM side-effecting functions to improve the accessibility and usability of single page apps.

Documentation at https://danielnixon.github.io/oaf-side-effects/

## Installation

```sh
# yarn
yarn add oaf-side-effects
# npm
npm install oaf-side-effects
```

## Browser Support

* Oaf Side Effects uses [closest()](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest), so for IE support you probably want to use the [closest() polyfill described at MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill) or https://github.com/jonathantneal/closest.
* By default Oaf Side Effects uses the smooth scrolling option of [scrollIntoView()](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView), so you might want to use the [smoothscroll polyfill](http://iamdustan.com/smoothscroll/).
