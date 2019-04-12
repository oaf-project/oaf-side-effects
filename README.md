[![Build Status](https://travis-ci.org/oaf-project/oaf-side-effects.svg?branch=master)](https://travis-ci.org/oaf-project/oaf-side-effects)
[![Known Vulnerabilities](https://snyk.io/test/github/oaf-project/oaf-side-effects/badge.svg?targetFile=package.json)](https://snyk.io/test/github/oaf-project/oaf-side-effects?targetFile=package.json)
[![Greenkeeper badge](https://badges.greenkeeper.io/oaf-project/oaf-side-effects.svg)](https://greenkeeper.io/)
[![npm](https://img.shields.io/npm/v/oaf-side-effects.svg)](https://www.npmjs.com/package/oaf-side-effects)

[![dependencies Status](https://david-dm.org/oaf-project/oaf-side-effects/status.svg)](https://david-dm.org/oaf-project/oaf-side-effects)
[![devDependencies Status](https://david-dm.org/oaf-project/oaf-side-effects/dev-status.svg)](https://david-dm.org/oaf-project/oaf-side-effects?type=dev)
[![peerDependencies Status](https://david-dm.org/oaf-project/oaf-side-effects/peer-status.svg)](https://david-dm.org/oaf-project/oaf-side-effects?type=peer)

# Oaf Side Effects

A collection of DOM side-effecting functions to improve the accessibility and usability of single page apps.

Documentation at https://oaf-project.github.io/oaf-side-effects/

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
