/**
 * Created by ganaraj on 10/11/14.
 */
var HeightIndexedPriorityList = require('./nodeheight').HeightIndexedPriorityList;
var types = require('ast-types');
var MultiMappingStore = require('./MultiMappingStore');
var _ = require('lodash');


var rootSrc, rootDest;

function popLarger (L1, L2) {
    if (L1.peekMax() > L2.peekMax()) {
        L1.open();
    } else {
        L2.open();
    }
}

var mappedNodes = [];

function match (source,dest) {

    mappedNodes = [];
    rootSrc = source;
    rootDest = dest;
    var multiMappings = new MultiMappingStore();

    var srcs = new HeightIndexedPriorityList();
    var dsts = new HeightIndexedPriorityList();
    var hSrcs, hDsts, srcMarks, dstMarks, src,dst;
    var i,j;

    srcs.push(source);
    dsts.push(dest);

    while (srcs.peekMax() != -Infinity && dsts.peekMax() != -Infinity) {
        while (srcs.peekMax() != dsts.peekMax()) {
            popLarger(srcs, dsts);
        }

        hSrcs = srcs.pop();
        hDsts = dsts.pop();

        srcMarks = _.map(hSrcs,function(){
            return false;
        });
        dstMarks = _.map(hDsts,function(){
            return false;
        });

        for (i = 0; i < hSrcs.length; i++) {
            for (j = 0; j < hDsts.length; j++) {
                src = hSrcs[i];
                dst = hDsts[j];

                if (src.hash === dst.hash) {
                    //console.log('match',src.type,src.loc,dst.loc);
                    multiMappings.link(src, dst);
                    srcMarks[i] = true;
                    dstMarks[j] = true;
                }
            }
        }

        for (i = 0; i < srcMarks.length; i++) {
            if (!srcMarks[i]) {
                srcs.open(hSrcs[i]);
            }
        }
        for (i = 0; i < dstMarks.length; i++) {
            if (!dstMarks[i]) {
                dsts.open(hDsts[i]);
            }
        }
    }
    return filterMappings(multiMappings);
}

function mapAllDescendants(src,dst){
    for (var i = 0; i < src.descendants.length; i++) {
        mappedNodes.push({ src : src.descendants[i].node,
            dst : dst.descendants[i].node});
        src.descendants[i].node.matched = true;
        dst.descendants[i].node.matched = true;

    }
}


function sortOnDice(list){
    for (var i = 0; i < list.length; i++) {
        list[i].sim = sim(list[i].src,list[i].dest);
    }
    return _.sortBy(list,'sim');
}

function numberOfCommonDescendants(src,dst){
    var count = 0;
    for (var i = 0; i < src.descendants.length; i++) {
        for (var j = 0; j < dst.descendants.length; j++) {
             if(dst.descendants[j].hash === src.descendants[i].hash){
                 count++;
             }
        }
    }
    return count;
}


function jaccardSimilarity(src, dst) {
    if(!src || !dst){
        return 1;
    }
    var num = numberOfCommonDescendants(src, dst);
    var den = src.descendants.length + dst.descendants.length - num;
    return num/den;
}

function getMaxTreeSize(){
    return _.max(rootSrc.descendants.length,rootDest.descendants.length);
}

function sim(src, dst) {
    var jaccard = jaccardSimilarity(src.parent, dst.parent);
    var posSrc = !src.parent ? 0 : _.findIndex(src.parent.descendants,{ hash : src.hash});
    var posDst = !dst.parent ? 0 : _.findIndex(dst.parent.descendants,{hash : dst.hash});
    var maxSrcPos =  !src.parent ? 1 : src.parent.descendants.length;
    var maxDstPos =  !dst.parent ? 1 : dst.parent.descendants.length;
    var maxPosDiff = Math.max(maxSrcPos, maxDstPos);
    var pos = 1 - (Math.abs(posSrc - posDst) /  maxPosDiff);
    // WTF is this ?
    var po = 1 - (Math.abs( src.nodeid - dst.nodeid) / getMaxTreeSize());
    return 100 * jaccard + 10 * pos + po;
}

//link two data structures.
//check unique
//get src from dst
//get dst from src.


function filterMappings(multiMappings) {
    //System.out.println("phase unique");
    // Select unique mappings first and extract ambiguous mappings.

    var ambiguousList = [];
    //Set<Tree> ignored = new HashSet<>();
    var ignored = [];

    var srcs = multiMappings.getAllSources();
    //for each source
    for (var i = 0 ;i < srcs.length;i++) {
        //if source is unique
        if (multiMappings.isSourceUnique(srcs[i])) {
            //add all descendant mappings
            mapAllDescendants(srcs[i], multiMappings.getDestinations(srcs[i])[0]);
            //add all mappings of src and its children
        }
        //if ignored doesnt contain the source node
        else if (!_.contains(ignored,srcs[i].hash)) {
            //list of dst's matching src.
            var destsForSrc = multiMappings.getDestinations(srcs[i]);
            //get list of src's that match dst[0] of src
            var srcsForDest = multiMappings.getSources(destsForSrc[0]);
            //for each source that matches dest[0]
            for (var j = 0; j < srcsForDest.length; j++) {
                //for each dest that matches the current source
                for (var k = 0; k < destsForSrc.length; k++) {
                    // map them and add to a list of mappings
                    ambiguousList.push( { dest : destsForSrc[k] ,
                        src : srcsForDest[j],
                        sim  : 0 });
                }
            }
            // add all sources that match dest[0] to ignored list.
            for (j = 0; j < srcsForDest.length; j++) {
                ignored.push(srcsForDest[j].hash);
            }
        }
    }

    //sort on matches using sim.
    ambiguousList = sortOnDice(ambiguousList);

    console.log(_.pluck(ambiguousList,'sim'));

    var srcIgnored = [];
    var destIgnored = [];

    //descending order
    for (i = ambiguousList.length - 1; i >= 0; i--) {
        if ( !(  _.contains(srcIgnored , ambiguousList[i].src.hash) ||
                _.contains(destIgnored, ambiguousList[i].dest.hash))) {
            mapAllDescendants(ambiguousList[i].src, ambiguousList[i].dest );
            srcIgnored.push(ambiguousList[i].src.hash);
            destIgnored.push(ambiguousList[i].src.hash);
        }

    }
    return mappedNodes;
}

module.exports = {
    match: match
};