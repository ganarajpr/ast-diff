/**
 * Created by ganaraj on 10/11/14.
 */

var nodeheight = require('./lib/nodeheight');
var Matcher = require('./lib/TopDownMatcher');

module.exports = function(src,dest){
    var mapped = Matcher.match(src,dest);
    mapped.map(function(pair){
        console.log(pair.src.type);
        console.log("source loc", pair.src.loc.start);
        console.log("dest loc" , pair.dst.loc.start);
    });
};