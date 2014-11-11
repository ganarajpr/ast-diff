var _ = require('lodash');

function MultiMappingStore() {

    var srcToDstMap = {};
    var dstToSrcMap = {};

    this.link = function(src,dst){
        if(!srcToDstMap.hasOwnProperty(src.hash)){
            srcToDstMap[src.hash] = {};
            srcToDstMap[src.hash].src = src;
            srcToDstMap[src.hash].dst = [];
        }
        srcToDstMap[src.hash].dst.push(dst);

        if(!dstToSrcMap.hasOwnProperty(dst.hash)){
            dstToSrcMap[dst.hash] = {};
            dstToSrcMap[dst.hash].src = [];
            dstToSrcMap[dst.hash].dst = dst;
        }
        dstToSrcMap[dst.hash].src.push(src);
    };

    this.getSources = function (){
        return _.pluck(_.values(srcToDstMap),'src');
    };

    this.isSourceUnique = function(src){
        var source = srcToDstMap[src.hash];
        return source && source.dst.length > 1;
    };

    this.getDestinations = function(src){
        var source = srcToDstMap[src.hash];
        if(source){
            return source.dst;
        }
    }

}

module.exports = MultiMappingStore;