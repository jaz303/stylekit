# stylekit

`stylekit` allows `style` elements to be created in the browser and bind their CSS rules to defined variables. The idea is to make it easy to construct applications with customisable themes that are modifiable at runtime.

## Terminology

A `StyleSet` is a list of `StyleBlocks` plus a global map of variable names/values. Each `StyleBlock` manages a DOM `style` element and its constituent CSS. This architecture allows a themeable application to create one `StyleBlock` for each module, with the global theme centrally controlled by the `StyleSet`'s variables.

## Variables

Each `StyleSet` has an associated map of named variables that can be referenced from CSS rules using a dollar-prefix (e.g. `$MY-VAR`). Each `StyleBlock` will automatically update it's linked `style` tag when any of its variables' values are altered.

There is no support for LESS/SCSS-like calculation syntax - `stylekit` is not a general purpose preprocessor.

## Usage

Install:

    $ npm install stylekit

Instantiate:

    var stylekit = require('stylekit');
    var myStyles = stylekit();

## Example

See `demo/index.htm` for an example that dynamically binds the rules of a couple of `StyleBlock`s to form inputs.

## API

#### `var styleSet = stylekit([doc])`

Create a new `StyleSet` with the given document `doc`. If omitted, `doc` defaults to `global.document || document`.

#### `styleSet.vars`

A [`wmap`](https://github.com/jaz303/wmap) containing this `StyleSet`'s variable mappings. In addition to the usual `wmap` methods, `getInt(key)` and `getFloat(key)` are also provided which will return the corresponding variables as ints and floats, respectively.

You can use the `vars.watch()` method to register your own callbacks to be fired when given variables are changed. This is useful, for example, if your application's layout is not purely CSS-driven and Javascript update routines must be called when the theme changes.

#### `styleSet.block()`

Attach a new `StyleBlock` to this `StyleSet` and return it.

#### `styleBlock.appendCSS(css)` (chainable)

Append a CSS string to this block. Each `StyleBlock` simply accumulates CSS in a string buffer so it's your responsibility to ensure that it's syntactically correct.

#### `styleBlock.rule(selector, css)`

Create (possibly nested) CSS rules using an instance of `[css-builder](https://github.com/jaz303/css-builder)`.

Variables are referenced with a dollar-prefix:

    styleSet.vars.set('MAIN_COLOR', 'red');
    styleBlock.appendCSS('h1 { color: $MAIN_COLOR }');

#### `styleBlock.commit()`

Create a `style` element and load this `StyleBlock`'s CSS into the DOM. A `StyleBlock` is immutable once committed, although it will regenerate whenever any of its variables change.

#### `styleBlock.destroy()`

Remove this block's `style` element from the DOM.