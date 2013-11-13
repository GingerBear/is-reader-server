define([], function () {

    var exports = {};
	// wrap a slide and hide method

    jQuery.fn.slideAndHide = function(direction, dis, speed, fn) {
        var option = {};
        option[direction] = (dis || "-=10");
        option['opacity'] = 0.5;

        $(this).animate(option, (speed || 100), function() {
            $(this).addClass('hidden');
            if (fn) fn();
        });
    };

    jQuery.fn.slideAndShow = function(direction, dis, speed, fn) {
        var option = {};
        option[direction] = (dis || "+=10");
        option['opacity'] = 1;

        $(this).css({opacity: 0.5}).removeClass('hidden').animate(option, (speed || 100), function() {
            if (fn) fn();
        });
    };

    Array.prototype.printFirstN  = function(n) {
        var s = '';
        var len = this.length;
        for(var i = 0; i < (n < len ? n : len); i++) {
            s += ' ' + this[i];
        }
        return s + ' ...';
    };

    exports.getURLParameter = function(name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
        );
    }

    return exports;
});