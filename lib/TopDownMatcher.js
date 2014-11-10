/**
 * Created by ganaraj on 10/11/14.
 */
var HeightIndexedPriorityList = require('./nodeheight').HeightIndexedPriorityList;


function openEverythingIn(priorityList){
    var nodes = [];
    while(priorityList.peekMax() !== -Infinity){
        nodes = nodes.concat(priorityList.pop());
    }
    nodes.map(function(node){
        priorityList.open(node);
    });
}


function popLarger(L1,L2){
    if (L1.peekMax() > L2.peekMax()) {
        L1.open();
    } else{
        L2.open();
    }
}

/*
* public void match() {
 MultiMappingStore multiMappings = new MultiMappingStore();

 PriorityTreeList srcs = new PriorityTreeList(src);
 PriorityTreeList dsts = new PriorityTreeList(dst);

 while (srcs.peekHeight() != -1 && dsts.peekHeight() != -1) {
 while (srcs.peekHeight() != dsts.peekHeight()) popLarger(srcs, dsts);

 List<Tree> hSrcs = srcs.pop();
 List<Tree> hDsts = dsts.pop();

 boolean[] srcMarks = new boolean[hSrcs.size()];
 boolean[] dstMarks = new boolean[hDsts.size()];

 for (int i = 0; i < hSrcs.size(); i++) {
 for (int j = 0; j < hDsts.size(); j++) {
 Tree src = hSrcs.get(i);
 Tree dst = hDsts.get(j);

 if (src.isClone(dst)) {
 multiMappings.link(src, dst);
 srcMarks[i] = true;
 dstMarks[j] = true;
 }
 }
 }

 for (int i = 0; i < srcMarks.length; i++) if (srcMarks[i] == false) srcs.open(hSrcs.get(i));
 for (int i = 0; i < dstMarks.length; i++) if (dstMarks[i] == false) dsts.open(hDsts.get(i));
 srcs.updateHeight();
 dsts.updateHeight();
 }

 filterMappings(multiMappings);
 }
* */

/*function match(src,dest,minHeight){
    var L1 = new HeightIndexedPriorityList();
    var L2 = new HeightIndexedPriorityList();
    L1.push(src);
    L2.push(dest);
    while ( L1.peekMax() !== -Infinity && L2.peekMax() !== -Infinity ){
        while (L1.peekMax() != L2.peekMax()){
            popLarger(L1, L2);
        }
        if(L1.peekMax() !== L2.peekMax()){
            if(L1.peekMax() > L2.peekMax() ){
                openEverythingIn(L1);
            }
            else{
                openEverythingIn(L2);
            }
        }
        else{
            var H1 = L1.pop();
            var H2 = L2.pop();
            for (var i = 0; i < H1.length; i++) {
                for (var j = 0; j < H2.length; j++) {


                }

            }
        }
    }
}*/



module.exports = {
    match : match
};