
  $.param = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return (results == null ? null : (results[1] || 0));
  };
//function(exports) {
//  exports.param = function(name){
//    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
//    return (results == null ? null : (results[1] || 0));
//  };
//}($)
