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
                console.log('opening ',elem.type);
                if(elem.type === 'ReturnStatement'){
                    console.log('return ' , elem.hash);
                }
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
            console.log('opening ',toOpen.type);
            if(toOpen.type === 'ReturnStatement'){
                console.log('return ' , toOpen.hash);
            }
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
        case 'loc':
        case 'end':
        case 'start':
        case 'descendants':
            return undefined;
    }
    return value;
}

function processNode(node){
    types.visit(node,{
        visitNode : function(path){
            this.traverse(path);
            var fieldHeights = [];
            path.node.descendants = [];
            types.eachField(path.node,function(name,value){
                if(value && name !== 'type' && value.type ){
                    fieldHeights.push(value.treeHeight);
                    path.node.descendants = path.node.descendants.concat(value.descendants);
                    path.node.descendants.push(value.hash);
                    value.parent = path.node;
                }
                else if (_.isArray(value)){
                    value.map(function(eachValue){
                        fieldHeights.push(eachValue.treeHeight);
                        path.node.descendants = path.node.descendants.concat(value.descendants);
                        path.node.descendants.push(eachValue.hash);
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