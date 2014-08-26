
var tape = require('tape');
var common = {};

var tests = [
  require('./compile.js'),
  require('./poi.js'),
  require('./quattroshapes.js'),
  require('./partial-suggest.js'),
  require('./partial-centroid.js'),
  require('./partial-admin.js'),
  require('./settings.js')
];

tests.map(function(t) {
  t.all(tape, common);
});