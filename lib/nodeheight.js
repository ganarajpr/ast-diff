/**
 * Created by ganaraj on 10/11/14.
 */

var types = require("ast-types");
var _ = require('lodash');


function HeightIndexedPriorityList(){

    var list = {};
    var maxTreeHeight = -Infinity;
    this.push = function push(node,path){
        if(!node.hasOwnProperty('treeHeight')){
            computeHeight(node);
        }
        if(!list.hasOwnProperty(node.treeHeight)){
            list[node.treeHeight] = [];
        }
        list[node.treeHeight].push({
            node : node,
            path : path
        });
        if(node.treeHeight > maxTreeHeight ){
            maxTreeHeight = node.treeHeight;
        }
    };

    var computeMaxTreeHeight = function(){
        maxTreeHeight = _.max(_.keys(list));
    }.bind(this);

    this.pop = function pop(){
        var maxTreeHeightNodes = list[maxTreeHeight];
        delete list[maxTreeHeight];
        computeMaxTreeHeight();
        return maxTreeHeightNodes;
    };

    this.peekMax = function peekMax(){
        return maxTreeHeight;
    };

    this.open = function open(node){
        types.eachField(node,function(name,value){
            if(value && name !== 'type' && value.type ){
                this.push(value);
            }
            else if (_.isArray(value)){
                value.map(function(eachValue){
                    this.push(eachValue);
                });
            }
        }.bind(this));
    };

}

function computeHeight(node){
    types.visit(node,{
        visitNode : function(path){
            this.traverse(path);
            var fieldHeights = [];
            types.eachField(path.node,function(name,value){
                if(value && name !== 'type' && value.type ){
                    fieldHeights.push(value.treeHeight);
                }
                else if (_.isArray(value)){
                    value.map(function(eachValue){
                        fieldHeights.push(eachValue.treeHeight);
                    });
                }
            });

            if(fieldHeights.length){
                path.node.treeHeight = _.max(fieldHeights)+1;
            }
            else{
                path.node.treeHeight = 1;
            }
        }
    });
    return node;
}


module.exports = {
    HeightIndexedPriorityList : HeightIndexedPriorityList
};