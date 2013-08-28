exports.ROCK_1             = 'r';
exports.ROCK               = exports.ROCK_1;
exports.ROCK2              = 'R';
exports.ROCK3              = 'q';
exports.EMPTY              = exports.ROCK3  // used in seeing double, same as rock?
exports.PATCH              = 'p';  // can't place blocks, but path can pass

exports.GREEN_THROUGH_ONLY = 'x';  // colored green, blocks red
exports.RED_THROUGH_ONLY   = 'X';  // colored red, blocks green

exports.GREEN_START        = 's';
exports.RED_START          = 'S';

exports.FINISH             = 'f';

exports.CHECKPOINT_1       = 'a';
exports.CHECKPOINT_2       = 'b';
exports.CHECKPOINT_3       = 'c';
exports.CHECKPOINT_4       = 'd';
exports.CHECKPOINT_5       = 'e';
var CHECKPOINT_1           = exports.CHECKPOINT_1;
var CHECKPOINT_2           = exports.CHECKPOINT_2;
var CHECKPOINT_3           = exports.CHECKPOINT_3;
var CHECKPOINT_4           = exports.CHECKPOINT_4;
var CHECKPOINT_5           = exports.CHECKPOINT_5;
exports.CHECKPOINTS        = [CHECKPOINT_1, CHECKPOINT_2, CHECKPOINT_3, CHECKPOINT_4, CHECKPOINT_5];

// dark blue
exports.TELE_IN_1          = 't';
exports.TELE_OUT_1         = 'u';
// green
exports.TELE_IN_2          = 'm';
exports.TELE_OUT_2         = 'n';
// red
exports.TELE_IN_3          = 'g';
exports.TELE_OUT_3         = 'h';
// light blue
exports.TELE_IN_4          = 'i';
exports.TELE_OUT_4         = 'j';
// light green
exports.TELE_IN_5          = 'k';
exports.TELE_OUT_5         = 'l';

var TELE_IN_1              = exports.TELE_IN_1;
var TELE_IN_2              = exports.TELE_IN_2;
var TELE_IN_3              = exports.TELE_IN_3;
var TELE_IN_4              = exports.TELE_IN_4;
var TELE_IN_5              = exports.TELE_IN_5;
var TELE_OUT_1             = exports.TELE_OUT_1;
var TELE_OUT_2             = exports.TELE_OUT_2;
var TELE_OUT_3             = exports.TELE_OUT_3;
var TELE_OUT_4             = exports.TELE_OUT_4;
var TELE_OUT_5             = exports.TELE_OUT_5;

exports.TELE_INS           = [TELE_IN_1, TELE_IN_2, TELE_IN_3, TELE_IN_4, TELE_IN_5];
exports.TELE_OUTS          = [TELE_OUT_1, TELE_OUT_2, TELE_OUT_3, TELE_OUT_4, TELE_OUT_5];