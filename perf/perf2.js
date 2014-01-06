
var t = new Date().getTime();
a = [1,2,3,4,4,4,5,6666,333,6,6,6,5,54,46,54,547347,345,3242,7777,7,658,68,756,8657,8,6453,645,36,3456,453,6,3456,3456,345,6,34,65]

for (var ppp = 0; ppp < 1000000; ppp++){
  for (var i = 0; i < a.length; i++) {
  }
}

var time_elapsed = new Date().getTime() - t;
var t = new Date().getTime();
for (var ppp = 0; ppp < 1000000; ppp++){
  for (var i = 0, il = a.length; i < il; i++) {
   
  }
}

var time_elapsed2 = new Date().getTime() - t;
console.log("ms elapsed:                      " , time_elapsed);
console.log("ms elapsed2:                      " , time_elapsed2);