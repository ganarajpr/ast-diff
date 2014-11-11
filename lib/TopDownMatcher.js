/**
 * Created by ganaraj on 10/11/14.
 */
var HeightIndexedPriorityList = require('./nodeheight').HeightIndexedPriorityList;
var types = require('ast-types');
var MultiMappingStore = require('./MultiMappingStore');
var _ = require('lodash');

function popLarger (L1, L2) {
    if (L1.peekMax() > L2.peekMax()) {
        L1.open();
    } else {
        L2.open();
    }
}
function match (source,dest) {
    var multiMappings = new MultiMappingStore();

    var srcs = new HeightIndexedPriorityList();
    var dsts = new HeightIndexedPriorityList();

    srcs.push(source);
    dsts.push(dest);

    while (srcs.peekMax() != -Infinity && dsts.peekMax() != -Infinity) {
        while (srcs.peekMax() != dsts.peekMax()) {
            popLarger(srcs, dsts);
        }

        var hSrcs = srcs.pop();
        var hDsts = dsts.pop();

        var srcMarks = _.map(hSrcs,function(){
            return false;
        });
        var dstMarks = _.map(hDsts,function(){
            return false;
        });

        for (var i = 0; i < hSrcs.length; i++) {
            for (var j = 0; j < hDsts.length; j++) {
                var src = hSrcs[i];
                var dst = hDsts[j];

                if (src.hash === dst.hash) {
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
    //filterMappings(multiMappings);
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
    var srcs = multiMappings.getSources();
    for (var i = 0 ;i < srcs.length;i++) {
        if (multiMappings.isSourceUnique(srcs[i])) {
            //addFullMapping(src, multiMappings.getDst(src).iterator().next());
            //add all mappings of src and its children
        }
        else if (!_.contains(ignored,srcs[i].hash)) {
            var destsForSrc = multiMappings.getDestinations(srcs[i]);
            var srcsForDest = multiMappings.getSources(destsForSrc[0]);
            for (var j = 0; j < destsForSrc.length; j++) {
                for (var k = 0; k < srcsForDest.length; k++) {
                    ambiguousList.push(destsForSrc[j]);
                    ambiguousList.push(srcsForDest[k]);

                }
                ignored.push(destsForSrc[j]);
            }
        }
    }

    //sort on matches.
    ambiguousList.sort();


    // System.out.println("phase ambiguous");
    // Select the best ambiguous mappings
    while (ambiguousList.length > 0) {
        var ambiguous = ambiguousList.splice(0,1);
        if (!(srcIgnored.contains(ambiguous.getFirst()) || dstIgnored.contains(ambiguous.getSecond()))) {
            addFullMapping(ambiguous.getFirst(), ambiguous.getSecond());
            srcIgnored.add(ambiguous.getFirst());
            dstIgnored.add(ambiguous.getSecond());
        }
    }
}

module.exports = {
    match: match
};