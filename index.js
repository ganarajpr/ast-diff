/**
 * Created by ganaraj on 10/11/14.
 */

var nodeheight = require('./lib/nodeheight');

module.exports = function(src,dest){
    nodeheight.getHeight(src);
};