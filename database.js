'use strict';
const core      = require('./src/db/core');
const nexus     = require('./src/db/nexus');
const scribe    = require('./src/db/scribe');
const wiki      = require('./src/db/wiki');
const director  = require('./src/db/director');
const color     = require('./src/db/color');
const timeline  = require('./src/db/timeline');
const map       = require('./src/db/map');
const relation  = require('./src/db/relation');
const hashtag   = require('./src/db/hashtag');
const navigator = require('./src/db/navigator');
const hero      = require('./src/db/hero');
const writer    = require('./src/db/writer');
const sage      = require('./src/db/sage');
const artisan   = require('./src/db/artisan');
const module_   = require('./src/db/module');
const classifier = require('./src/db/classifier');

module.exports = {
  ...core,
  ...nexus,
  ...scribe,
  ...wiki,
  ...director,
  ...color,
  ...timeline,
  ...map,
  ...relation,
  ...hashtag,
  ...navigator,
  ...hero,
  ...writer,
  ...sage,
  ...artisan,
  ...module_,
  ...classifier,
};
