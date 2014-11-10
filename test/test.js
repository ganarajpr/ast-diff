/**
 * Created by ganaraj on 10/11/14.
 */

var filestoast = require('filestoast');

var diff = require('../index');
var dir = '**/simpletest*.js';


function onProcessingComplete(files){
    diff(files[0].ast,files[1].ast);
}


filestoast
    .process(dir)
    .then(onProcessingComplete);