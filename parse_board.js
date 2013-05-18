TYPE_MAP = {
    'a': 'A',
    'b': 'B',
    'c': 'C',
    'd': 'D',
    's': 's',
    'f': 't',
    'r': 'X',
    't': '1',
    'u': '!',
    'm': '2',
    'n': '@',
    'g': '3',
    'h': '#',
    'i': '4',
    'j': '$',
    'k': '5',
    'l': '%',
}

function parse_board(code) {
  var head = code.split(':')[0];
  var body = code.split(':')[1];

  var head = head.split('.');
  var dims = head[0].split('x');
  var width = parseInt(dims[0], 10);
  var height = parseInt(dims[1], 10);
  if (head[1][0] != 'c') {console.log('head[1][0] was ' + head[1][0] + ' expected c');}
  var targets = parseInt(head[1].slice(1), 10);
  if (head[2][0] != 'r') {console.log('head[2][0] was ' + head[2][0] + ' expected r');}
  if (head[3][0] != 'w') {console.log('head[3][0] was ' + head[3][0] + ' expected w');}
  //if (board['walls'] != parseInt(head[3].slice(1))) {console.log('board.walls is different from walls in header');}
  if (head[4][0] != 't') {console.log('head[4][0] was ' + head[4][0] + ' expected t');}

  var teleports = parseInt(head[4].slice(1), 10)

  var data = new Array();
  for (i = 0; i < height; i++) {
    var row = new Array();
    for (j = 0; j < width; j++) {
      row.push(' ');
    }
    data.push(row);
  }

  var i = -1;
  var j = width - 1;
  var body_split = body.split('.').slice(0, -1);

  for (var k = 0; k < body_split.length; k++) { 
    var item = body_split[k];
    for (var l = 0; l < parseInt(item.slice(0, -1), 10) + 1; l++) {
      j += 1;
      if (j >= width) {
        j = 0;
        i += 1;
      }
    }
    var type = item[item.length - 1];
    if (!TYPE_MAP.hasOwnProperty(type)) {console.log('Unexpected type ' + type);}
    data[i][j] = TYPE_MAP[type];
  }
  //board['data'] = [''.join(row) for row in data]
  //board['data'] = new Array();
  //return board
  return data;
}
