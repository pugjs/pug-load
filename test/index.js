'use strict';

var fs = require('fs');
var assert = require('assert');
var lex = require('jade-lexer');
var parse = require('jade-parser');
var load = require('../');

var filename = __dirname + '/foo.jade';
var ast = load.file(filename, {
  lex: lex,
  parse: parse
});

var expected = JSON.parse(fs.readFileSync(__dirname + '/expected.json', 'utf8'));
fs.writeFileSync(__dirname + '/output.json', JSON.stringify(ast, null, '  '));

assert.deepEqual(expected, ast);
console.log('tests passed');
