/**
 * Created by ganaraj on 10/11/14.
 */

var types = require("ast-types");
var _ = require('lodash');
var md5 = require('MD5');


function HeightIndexedPriorityList(){

    var list = {};
    var maxTreeHeight = -Infinity;
    this.push = function push(node,path){
        if(!node.hasOwnProperty('treeHeight')){
            processNode(node);
        }
        if(!list.hasOwnProperty(node.treeHeight)){
            list[node.treeHeight] = [];
        }
        list[node.treeHeight].push(node);
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

    this.open = function open(toOpen){
        if(!toOpen){
            toOpen = this.pop();
        }
        if(_.isArray(toOpen)){
            toOpen.forEach(function(elem){
                types.eachField(elem,function(name,value){
                    if(value && name !== 'type' && value.type ){
                        this.push(value);
                    }
                    else if (_.isArray(value)){
                        value.map(function(eachValue){
                            this.push(eachValue);
                        }.bind(this));
                    }
                }.bind(this));
            }.bind(this));
        }
        else{
            types.eachField(toOpen,function(name,value){
                if(value && name !== 'type' && value.type ){
                    this.push(value);
                }
                else if (_.isArray(value)){
                    value.map(function(eachValue){
                        this.push(eachValue);
                    }.bind(this));
                }
            }.bind(this));
        }
    };

}

function replacer(key,value){
    switch(key){
        case 'parent':
        case 'hash':
        case 'treeHeight':
            return undefined;
    }
    return value;
}

function processNode(node){
    types.visit(node,{
        visitNode : function(path){
            this.traverse(path);
            var fieldHeights = [];
            types.eachField(path.node,function(name,value){
                if(value && name !== 'type' && value.type ){
                    fieldHeights.push(value.treeHeight);
                    value.parent = path.node;
                }
                else if (_.isArray(value)){
                    value.map(function(eachValue){
                        fieldHeights.push(eachValue.treeHeight);
                        value.parent = path.node;
                    });
                }
            });

            if(fieldHeights.length){
                path.node.treeHeight = _.max(fieldHeights)+1;
                path.node.hash = hash(path.node);
            }
            else{
                path.node.treeHeight = 1;
                path.node.hash = hash(path.node);
            }
        }
    });
    return node;
}

function hash(node){
    return md5(JSON.stringify(node,replacer));
}


module.exports = {
    HeightIndexedPriorityList : HeightIndexedPriorityList,
    processNode : processNode,
    hash : hash
};