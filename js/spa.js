/*global $, spa */

var spa = (function () {



  var initModule = function( $container ) {
    spa.shell.initModule( $container );
  };

  var test = function(numero) {
    console.log(numero);
  };

  return {
    initModule: initModule,
    test: test
  };

}());