**jscsrc-guesser** – JSCS configuration guesser

**jscsrc-guesser** is a tool that checks some code base and finds those JSCS
rules the code base follows.

This version emits rules for JSCS 1.13.1.

## Installation

    $ npm install -g jscsrc-guesser

## Usage

Just run `jscsrc-guesser` with your code path(s) as argument(s):

    $ jscsrc-guesser bin/ lib/ tests/ > autogenerated.jscsrc

You can also pass some optional arguments you could pass to `jscs`:

    $ jscsrc-guesser --esnext index.js > autogenerated.jscsrc

## Known limitations

* `requireNamedUnassignedFunctions` is not tried with `allExcept` values
* `requireSpacesInsideArrayBrackets` is not tried with `allExcept` values
* `requireSpacesInsideObjectBrackets` is not tried with `allExcept` values
* `requirePaddingNewLinesAfterBlocks` is not tried with `allExcept` values due to [a bug](https://github.com/jscs-dev/node-jscs/issues/1343)
* `requireOperatorBeforeLineBreak` is only tried with value `true`
* `disallowOperatorBeforeLineBreak` is only tried with value `true`
* `requireSpacesInsideParentheses` is only tried with value `all`
* `safeContextKeyword` is only tried for value `_this` and `self`
* `maximumNumberOfLines` is only tried with a fixed set of values (50, 100, 200, 500, 1000, 2000)
* `maximumLineLength` is only tried with a fixed set of values (72, 75, 80, 90, 100, 120)
* `requireSpaceBeforeBlockStatements` is only tried with a fixed set of values (1, 2, 3, 4, 5)
* `validateParameterSeparator` is only tried with a fixed set of values (`','`, `' ,'`, `', '`)
* `validateIndentation` is not tried with all valid configurations
* `validateNewlineAfterArrayElements` is not tried with all valid configurations

## Changelog

### 0.3.0 (???)

* Fix JSCS invocation by setting `maxErrs` to `Infinity`

### 0.2.0 (2015-11-20)

* Don't include contradictory rules
* Better handling of validateIndentation, maximumLineLength, requireAlignedObjectValues,
  validateLineBreaks, validateParameterSeparator
* Update to JSCS 1.13

### 0.1.1 (2015-04-25)

* Fix JSCS invocation
* Show errors emitted by JSCS
* Add JSCS check to `npm test` pipeline

### 0.1.0 (2015-04-22)

* Initial version.

## Todo

### Fixes
* Handle all different possible values for all rules
* Fold multi-value options back to true

### Features
* Compare to presets or existing jscsrc
* Sort rules in output alphabetically
* Add i18n
* Check which rules checked successfully instead of which rules didn't fail
* Handle rules which failed rarely (for example by interactively proposing to
add them to the output)

## License

AGPL
