# jade-load

The jade loader is responsible for loading the depenendencies of a given jade file.  It adds `fullPath` and `str` properties to every `Include` and `Extends` node.  It also adds an `ast` property to any `Include` nodes that are loading jade and any `Extends` nodes.  It then recursively loads the dependencies of any of those included files.

[![Build Status](https://img.shields.io/travis/jadejs/jade-load/master.svg)](https://travis-ci.org/jadejs/jade-load)
[![Dependency Status](https://img.shields.io/gemnasium/jadejs/jade-load.svg)](https://gemnasium.com/jadejs/jade-load)
[![NPM version](https://img.shields.io/npm/v/jade-load.svg)](https://www.npmjs.org/package/jade-load)

## Installation

    npm install jade-load

## Usage

```js
var load = require('jade-load');
```

### `load(ast, options)`
### `load.string(str, options)`
### `load.file(file, options)`

Loads all dependencies of the Jade AST. `load.string` and `load.file` are syntactic sugar that parses the string or file instead of you doing it yourself.

`options` may contain the following properties:

- `lex` (function): **(required)** the lexer used
- `parse` (function): **(required)** the parser used
- `resolve` (function): a function used to override `load.resolve`. Defaults to undefined, i.e. `load.resolve` is used.
- `read` (function): a function used to override `load.resolve`. Defaults to undefined, i.e. `load.read` is used.
- `basedir` (string): the base directory of absolute inclusion. This is **required** when absolute inclusion (file name starts with `'/'`) is used. Defaults to undefined.

The `options` object is passed to `load.resolve` and `load.read`.

### `load.resolve(filename, source, options)`

Callback used by `jade-load` to resolve the full path of an included or extended file given the path of the source file. If `options` contain a `resolve` property, then that function is called and its results returned.

This function is not meant to be called from outside of `jade-load`, but rather for you to override.

`filename` is the included file. `source` is the name of the parent file that includes `filename`.

### `load.read(filename, options)`

Callback used by `jade-load` to return the contents of a file. If `options` contain a `read` property, then that function is called and its results returned instead of this function.

This function is not meant to be called from outside of `jade-load`, but rather for you to override.

`filename` is the file to read.

### `load.validateOptions(options)`

Callback used `jade-load` to ensure the options object is valid. If your overriden `load.resolve` or `load.read` use a different `options` schema, you will need to override this function as well.

This function is not meant to be called from outside of `jade-load`, but rather for you to override.

### Example

```js
var fs = require('fs');
var lex = require('jade-lexer');
var parse = require('jade-parser');
var load = require('jade-load');

// you can do everything very manually

var str = fs.readFileSync('bar.jade', 'utf8');
var ast = load(parse(lex(str, 'bar.jade'), 'bar.jade'), {
  lex: lex,
  parse: parse,
  resolve: function (filename, source, options) {
    console.log('"' + filename + '" file requested from "' + source '".');
    return load.resolve(filename, source, options);
  }
});

// or you can do all that in just two steps

var str = fs.readFileSync('bar.jade', 'utf8');
var ast = load.string(str, 'bar.jade', {
  lex: lex,
  parse: parse,
  resolve: function (filename, source, options) {
    console.log('"' + filename + '" file requested from "' + source '".');
    return load.resolve(filename, source, options);
  }
});

// or you can do all that in only one step

var ast = load.file('bar.jade', {
  lex: lex,
  parse: parse,
  resolve: function (filename, source, options) {
    console.log('"' + filename + '" file requested from "' + source '".');
    return load.resolve(filename, source, options);
  }
});
```

## License

  MIT
