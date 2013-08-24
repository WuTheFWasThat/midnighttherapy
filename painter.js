window.PatheryUtil = {};
(function(exports) {
    // TODO: borrow these for now
    var is_block_there = exports.is_block_there = window.PatheryAssist.is_block_there;
    var refresh_score = window.PatheryAssist.refresh_score;
    var click_block_untriggered = window.PatheryAssist.click_block_untriggered;

    // TODO: this one should go elsewhere
    var make_line = exports.make_line = function (sx, sy, ex, ey) {
        var ret = $('<div>').css({
            position: 'absolute',
            height: '3px',
            'background-color': '#06a',
            'z-index': '1000',
            '-webkit-transform-origin': 'top left',
            '-moz-transform-origin': 'top left',
            '-o-transform-origin': 'top left',
            '-ms-transform-origin': 'top left',
            'transform-origin': 'top left',
        });

        var dx = ex - sx, dy = ey - sy;
        var l = Math.sqrt(dx * dx + dy * dy);
        var angle = 180 / Math.PI *
            Math.atan2(dy, dx);

        var rot = 'rotate(' + angle + 'deg)';
        ret.css({
            top: sy + 'px',
            left: sx + 'px',
            width: l + 'px',
            '-webkit-transform': rot,
            '-moz-transform': rot,
            '-o-transform': rot,
            '-ms-transform': rot,
            'transform': rot,
        });
        return ret;
    };

    var equals = exports.equals = function(b1, b2) {
        return b1[0] == b2[0] && b1[1] == b2[1];
    };

    var adjacent = exports.adjacent = function(b1, b2) {
        return (Math.abs(b1[0] - b2[0]) <= 1 &&
                Math.abs(b1[1] - b2[1]) <= 1);
    };

    // TODO: instead of passing mapid everywhere, maybe we can make a class
    var get_div = exports.get_div = function(mapid, block) {
        var x = block[0] + 1, y = block[1];
        return $("[id='" + mapid + ',' + x + ',' + y + "']");
    };

    var get_coords = exports.get_coords = function(mapid, block) {
        var div = get_div(mapid, block);
        var offset = div.offset();

        return {
            x: offset.left + (div.width() / 2),
            y: offset.top + (div.height() / 2)
        }
    };

    var place = exports.place = function(mapid, block) {
        var block_div = get_div(mapid, block);
        var block_class = block_div.attr('class');
        if (block_class == 'mapcell o' || block_class == 'o') {
            window.grid_click(block_div[0]);
            refresh_score();
        }
    };

    var remove = exports.remove = function(mapid, block) {
        if (is_block_there(mapid, block)) {
            click_block_untriggered(mapid, block);
            refresh_score();
        }
    };
})(window.PatheryUtil);


window.MoveHandler = {};
(function(exports) {
    var move_listeners = [];

    function add_move_listener(fn) {
        move_listeners.push(fn);
    }

    function remove_move_listener(fn) {
        for (var i = 0; i < move_listeners.length; i++) {
            if (fn === move_listeners[i]) {
                move_listeners.splice(i, 1);
                return;
            }
        }
    }

    function block_from_block_string(block_string) {
        var string_coordinates = block_string.split(',');
        var x = parseInt(string_coordinates[0]) - 1;
        var y = parseInt(string_coordinates[1]);
        var block = [x, y];
        return block;
    }

    // TODO: make this all more robust against map id changes
    $('.playable > div').mousemove(function(e) {
        var id = $(this).attr('id');
        var first_comma_index = id.indexOf(',');
        var block = block_from_block_string(id.slice(first_comma_index+1));

        // Only attempt to add/remove blocks if you're not at the tile corner.
        var x_offset = (e.pageX - $(this).offset().left) / $(this).width();
        var y_offset = (e.pageY - $(this).offset().top) / $(this).height();
        var on_corner = ((x_offset < 0.3 || x_offset > 0.7) &&
                         (y_offset < 0.3 || y_offset > 0.7));
        if (on_corner)
            return;

        for (var i = 0; i < move_listeners.length; i++) {
            move_listeners[i](block);
        }
    });

    exports.add_move_listener = add_move_listener;
    exports.remove_move_listener = remove_move_listener;
})(window.MoveHandler);


window.Painter = {};
(function(exports) {
    var pathery = window.PatheryUtil;
    var equals = pathery.equals, adjacent = pathery.adjacent;

    var Painter = exports.Painter = function(mapid) {
        this.mapid = mapid;
        this.paint_stack = []; // list of [block, line|null]

        this._move_listener = this._hover.bind(this);
    };

    Painter.prototype.start = function() {
        window.MoveHandler.add_move_listener(this._move_listener);
    };

    Painter.prototype.finish = function() {
        window.MoveHandler.remove_move_listener(this._move_listener);
        // remove drawn lines
        var stack_size = this.paint_stack.length;
        for (var i = 0; i < stack_size; i++)
            this._pop();
    };

    Painter.prototype._pop = function() {
        var last = this.paint_stack.pop();
        if (last[1])
            last[1].detach();
        return last[0];
    };

    Painter.prototype._push = function(block) {
        var line_elt = null;
        var last = this._nth(1);
        if (last) {
            var start = pathery.get_coords(this.mapid, last);
            var end = pathery.get_coords(this.mapid, block);
            line_elt = pathery.make_line(start.x, start.y, end.x, end.y);
            $(document.body).append(line_elt);
        }
        this.paint_stack.push([block, line_elt]);
    };

    Painter.prototype._nth = function(n) {
        var len = this.paint_stack.length
        if (len < n)
            return null;
        return this.paint_stack[len - n][0];
    };

    // doesn't have to be placeable; can be things like walls
    Painter.prototype._is_paintable = function(block) {
        // TODO: maybe we should allow painting over existing blocks
        if (pathery.is_block_there(this.mapid, block))
            return false;

        // even if there is no block there, it could be invalid if
        // it's a rock we already painted
        for (var i = 0; i < this.paint_stack.length; i++) {
            if (equals(this.paint_stack[i][0], block))
                return false;
        }

        var top = this._nth(1);
        if (top && !adjacent(top, block))
            return false;


        // TODO: temporary hack for testing if you're out of blocks
        if (window.mapdata[this.mapid].usedWallCount == 0)
            return false;

        var block_class = pathery.get_div(this.mapid, block).attr('class');
        // allowed are empty spaces and existing walls
        if (block_class != "mapcell o" && block_class != "o"
            && block_class != "mapcell r")
            return false;

        return true;
    };

    Painter.prototype._hover = function(block) {
        // check up to kth block in stack to see if this is a backtrack
        var k = 3;
        for (var i = 2; i <= k; i++) {
            var existing = this._nth(i);
            if ((!existing) || (!equals(block, existing)))
                continue;

            for (var j = 0; j < i - 1; j++) {
                var popped_block = this._pop();
                pathery.remove(this.mapid, popped_block);
            }
            return;
        }

        if (this._is_paintable(block)) {
            // eliminates sharp turns
            // TODO: this might not be desirable in all cases
            while (true) {
                var top = this._nth(1), prev = this._nth(2);
                if (top && prev &&
                    adjacent(top, block) && adjacent(prev, block)) {
                    // TODO: this should only be activated with a cooldown
                    var popped_block = this._pop();
                    pathery.remove(this.mapid, popped_block);
                    continue;
                }
                break;
            }

            this._push(block);
            pathery.place(this.mapid, block);
        }
    };

    var cur_painter = null;
    $('.playable > div').mousedown(function(e) {
        if (!e.shiftKey || cur_painter)
            return;
        console.log('painter start');

        // TODO: make this less hacky
        cur_painter = new Painter(window.PatheryAssist.get_mapid());
        cur_painter.start();
    });
    $('.playable > div').mouseup(function(e) {
        if (!cur_painter)
            return;

        console.log('painter finish');
        cur_painter.finish();
        cur_painter = null;
    });

})(window.Painter);