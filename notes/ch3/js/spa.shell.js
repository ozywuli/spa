/*
 * spa.js
 * Root namespace module
*/

/* jslint
  browser: true,
  coninue: true,
  devel; true,
  indent: 2,
  maxerr: 50,
  newcap: true,
  nomen: true,
  plusplus: true,
  regexp: true,
  sloppy: true,
  vars: false,
  white: true
*/
/* global $, spa  */


var strVar = "";
strVar += "<div id=\"spa\">";
strVar += "  <div class=\"spa-shell-head\">";
strVar += "    <div class=\"spa-shell-head-logo\"><\/div>";
strVar += "    <div class=\"spa-shell-head-acct\"><\/div>";
strVar += "    <div class=\"spa-shell-head-search\"><\/div>";
strVar += "  <\/div>";
strVar += "  <div class=\"spa-shell-main\">  ";
strVar += "    <div class=\"spa-shell-main-nav\"><\/div>";
strVar += "    <div class=\"spa-shell-main-content\"><\/div>";
strVar += "  <\/div>";
strVar += "  <div class=\"spa-shell-foot\"><\/div>";
strVar += "  <div class=\"spa-shell-chat\"><\/div>";
strVar += "  <div class=\"spa-shell-modal\"><\/div>";
strVar += "<\/div>";



spa.shell = (function() {




// begin module scope variables
var configMap = {
  anchor_schema_map: {
    chat: {open: true, closed: true}
  },
  // what in the world does String() do???
  main_html : String() + strVar,
  chat_extend_time: 1000,
  chat_retract_time: 300,
  chat_extend_height: 450,
  chat_retract_height: 15,
  chat_extended_title: 'Click to retract',
  chat_retracted_title: 'Click to extend'
};
var stateMap = {
  $container: null,
  anchor_map : {},
  is_chat_retracted: true
};
var jqueryMap = {};
var setJqueryMap;
var toggleChat;
var onClickChat;
var copyAnchorMap;
var changeAnchorPart;
var onHashchange;
var initModule;
// end modile scope variables



// begin utility methods
// returns copy of stored anchor map; minimizes overhead
copyAnchorMap = function() {
  return $.extend( true, {}, stateMap.anchor_map );
};
// end utility methods




// begin dom methods
// begin DOM method /changeAnchorPart/
// Purpose: Changes part of the URI anchor component
// Arguments:
//   * arg_map - the map describing what part of the URI anchor we want changed.
// Returns: boolean
//   * true - the Ancor portion of the URI was update
//   * false - the Anchor portion of the URI could not be updated
// Action:
//   The current anchor rep stored in stateMap.anchor_map.
//     See uriAnchor for a discussion of encoding.
//     This method
//       * creates a copy of this map using copyAnchorMap().
//       * modifies the key-values using arg_map.
//       * manages the distinction between independent and dependent values in the encoding
//       * attempts to change the URI using uriAnchor
//       * returns true on success, and false on failure
changeAnchorPart = function(arg_map) {
  var anchor_map_revise = copyAnchorMap();
  var bool_return = true;
  var key_name;
  var key_name_dep;

  // begin merge changes into anchor map
  KEYVAL:
  for (key_name in arg_map) {
    if (arg_map.hasOwnProperty(key_name)) {
      if (key_name.indexOf('_') === 0) { continue KEYVAL; }

      anchor_map_revise[key_name] = arg_map[key_name];

      key_name_dep = '_' + key_name;
      if (arg_map[key_name_dep]) {
        anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
      } else {
        delete anchor_map_revise[key_name_dep];
        delete anchor_map_revise['_s' + key_name_dep];
      }
    }
  }

try {
  $.uriAnchor.setAnchor(anchor_map_revise);
}
catch (error) {
  $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
  bool_return = false;
}
 return bool_return;
};

// end DOM method /changeAnchorPart/
// begin DOM method /setJquerymap/
setJqueryMap = function() {
  var $container = stateMap.$container;
  jqueryMap = {
    $container: $container,
    $chat: $container.find( '.spa-shell-chat' )
  };
};
// end DOM method /setJquerymap/

// begin DOM method /toggleChat/
// Purpose: Extends or retracts chat slider
// Arguments:
// * do_extend - if true, extends slider; if false retracts
// * callback - optional function to execute at end of animation
// Settings:
// * chat_extend_time, chat_retract_time
// * chat_extend_height, chat_retract_height
// Returns: boolean
// * true - slider animation activated
// * false - slider animation not activated
//
// State: sets stateMap.is_chat_retracted
// * true - slider is retracted
// * false - slider is extended
toggleChat = function(do_extend, callback) {

  var px_chat_ht = jqueryMap.$chat.height();
  var is_open = px_chat_ht === configMap.chat_extend_height;
  var is_closed = px_chat_ht === configMap.chat_retract_height;
  var is_sliding = !is_open && !is_closed;

  // avoid race condition
  if ( is_sliding ) {
    return false;
  }
  // begin extend chat slider
  if ( do_extend ) {
    jqueryMap.$chat.animate(
      { height: configMap.chat_extend_height },
      configMap.chat_extend_time,
      function() {
        jqueryMap.$chat.attr(
          'title', configMap.chat_extended_title
        );
        stateMap.is_chat_retracted = false;
        if ( callback ) { callback( jqueryMap.$chat ); }
      }
    );
    return true;
  }
  // end extend chat slider

  // begin retract chat slider
  jqueryMap.$chat.animate(
    { height: configMap.chat_retract_height },
    configMap.chat_retract_time,
    function() {
      jqueryMap.$chat.attr(
        'title', configMap.chat_retracted_title
      );
      stateMap.is_chat_retracted = true;
      if ( callback ) { callback( jqueryMap.$chat ); }
    }
  );
  return true;
};
// end DOm method /toggleChat/
// end dom methods





//begin event handlers

onHashchange = function(event) {
  var anchor_map_previous = copyAnchorMap();
  var anchor_map_proposed;
  var _s_chat_previous;
  var _s_chat_proposed;
  var s_chat_proposed;

  try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
  catch (error) {
    $.uriAnchor.setAnchor(anchor_map_previous, null, true);
    return false;
  }
  stateMap.anchor_map = anchor_map_proposed;

  _s_chat_previous = anchor_map_previous._s_chat;
  _s_chat_proposed = anchor_map_proposed._s_chat;

  if ( !anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
    s_chat_proposed = anchor_map_proposed.chat;
    switch (s_chat_proposed) {
      case 'open':
        toggleChat(true);
        break;
      case 'closed':
        toggleChat(false);
        break;
      default:
        toggleChat(false);
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
    }
  }

  return false;
};

onClickChat = function(event) {
  changeAnchorPart({
    chat: (stateMap.is_chat_retracted ? 'open' : 'closed' )
  });
  return false;
};
//end event handlers



// begin public methods
// begin public method /initModule/
initModule = function($container) {
  // load HTML and map juery collections
  stateMap.$container = $container;
  $container.html(configMap.main_html);
  setJqueryMap();

  // initialize chat slider and bind click handler
  stateMap.is_chat_retracted = true;
  jqueryMap.$chat
    .attr('title', configMap.chat_retracted_title)
    .click(onClickChat);

    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    $(window)
      .bind('hashchange', onHashchange)
      .trigger('hashchange');
};
// end public method /initModule/
// end public methods


return { initModule: initModule };




}());




