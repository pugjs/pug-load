'use strict';

var fs = require('fs');
var path = require('path');
var walk = require('jade-walk');

module.exports = load;
function load(ast, options) {
  load.validateOptions(options);
  // clone the ast
  ast = JSON.parse(JSON.stringify(ast));
  return walk(ast, function (node) {
    if (node.str === undefined) {
      if (node.type === 'Extends') {
        var path = load.resolve(node.path, node.filename, options);
        if (!/\.jade$/.test(path)) {
          path += '.jade';
        }
        node.fullPath = path;
        var str = load.read(path, options);
        node.str = str;
        node.ast = load.string(str, path, options);
      }
      if (node.type === 'Include') {
        var path = load.resolve(node.path, node.filename, options);
        node.fullPath = path;
        var str = load.read(path, options);
        node.str = str;
        if (!node.filter && /\.jade$/.test(path)) {
          node.ast = load.string(str, path, options);
          node.raw = false;
        } else {
          node.raw = !node.filter;
        }
      }
    }
  });
}

load.string = function loadString(str, filename, options) {
  load.validateOptions(options);
  var tokens = options.lex(str, filename);
  var ast = options.parse(tokens, filename);
  return load(ast, options);
};
load.file = function loadFile(filename, options) {
  load.validateOptions(options);
  var str = load.read(filename, options);
  return load.string(str, filename, options);
}

load.resolve = function resolve(filename, source, options) {
  if (options && options.resolve) return options.resolve(filename, source, options);
  filename = filename.trim();
  source = source.trim();
  if (filename[0] !== '/' && !source)
    throw new Error('the "filename" option is required to use includes and extends with "relative" paths');

  if (filename[0] === '/' && !options.basedir)
    throw new Error('the "basedir" option is required to use includes and extends with "absolute" paths');

  filename = path.join(filename[0] === '/' ? options.basedir : path.dirname(source), filename);

  if (path.basename(filename).indexOf('.') === -1) filename += '.jade';

  return filename;
};
load.read = function read(filename, options) {
  if (options && options.read) return options.read(filename, options);
  return fs.readFileSync(filename, 'utf8');
};

load.validateOptions = function validateOptions(options) {
  if (typeof options.lex !== 'function') {
    throw new TypeError('options.lex must be a function');
  }
  if (typeof options.parse !== 'function') {
    throw new TypeError('options.parse must be a function');
  }
  if (options.resolve && typeof options.resolve !== 'function') {
    throw new TypeError('options.resolve must be a function');
  }
  if (options.read && typeof options.read !== 'function') {
    throw new TypeError('options.read must be a function');
  }
};
