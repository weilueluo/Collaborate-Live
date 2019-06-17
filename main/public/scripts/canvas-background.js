
$(function() {
  var $bg = $('#background');
  var $fg = $('#foreground');
  var fg = document.getElementById('foreground');
  var bg = document.getElementById('background');
  var taskbackground = "linear-gradient(to left top, #0c172c, #12203a, #182948, #1d3357, #233d67, #233d67, #233d66, #233d66, #1d3356, #172946, #121f37, #0c1629)";
  var codingbackground = "linear-gradient(to left top, #042a20, #043729, #044432, #06523b, #096044, #0a6044, #0b6044, #0c6044, #09523b, #084432, #083729, #072a20)";
  var drawingbackground = "linear-gradient(to left top, #2a0e26, #360f33, #431040, #4f114f, #5b115e, #5c115f, #5e105f, #5f1060, #551052, #4a1044, #3f1038, #34102c)";
  var chatbackground = "linear-gradient(to right, #000000 0%,#005408 70%,#005905 89%,#005905 94%,#004f11 100%)";
  var terminalbackground = "linear-gradient(to left top, #300000, #3a0102, #440004, #4f0004, #590003, #590003, #590003, #590003, #4e0004, #430104, #380203, #2e0000)";

  $('#tab-task-button').mousedown(function(e) {
    togglewallpaper(taskbackground);
  })

  $('#tab-drawing-button').mousedown(function() {
    togglewallpaper(drawingbackground);
  })

  $('#tab-coding-button').mousedown(function(e) {
    togglewallpaper(codingbackground);
  })

  $('#tab-terminal-button').mousedown(function(e) {
   togglewallpaper(terminalbackground);
  })

  $('#getname').mousedown(chatToggle);
  $('#chat').mousedown(chatToggle);

  function chatToggle() {
    togglewallpaper(chatbackground);
  }

  var currentbg;
  function togglewallpaper(backg) {
    if(currentbg != backg) {
      $bg.animate({ opacity : '0' });
      setTimeout( () => $bg.css('background', backg), 400 );// prevent flash
      $bg.animate({ opacity : '1' });
      currentbg = backg;
    }
  }
})
