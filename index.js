/**
 * Created by ganaraj on 10/11/14.
 */

var nodeheight = require('./lib/nodeheight');
var Matcher = require('./lib/TopDownMatcher');

module.exports = function(src,dest){
    Matcher.match(src,dest);
};