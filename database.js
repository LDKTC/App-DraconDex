'use strict';
const core      = require('./src/db/core');
const director  = require('./src/db/director');
const color     = require('./src/db/color');
const timeline  = require('./src/db/timeline');
const map       = require('./src/db/map');
const relation  = require('./src/db/relation');
const hashtag   = require('./src/db/hashtag');
const navigator = require('./src/db/navigator');

module.exports = {
  ...core,
  ...director,
  ...color,
  ...timeline,
  ...map,
  ...relation,
  ...hashtag,
  ...navigator,
};
