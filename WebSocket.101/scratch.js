"use strict";

var data = {
  one: 1,
  two: "two",
  three: true,
  four: "Akeu coucou"
};

var getKeys = function(obj){
   for(var key in obj){
      console.log('=> ' + key + ', ' + obj[key]);
   }
};

var list = ['a', 'b', 'c', 'd'];

getKeys(data);

var k = 'A';
console.log(k + " in list:" + (list.indexOf(k) > -1));
