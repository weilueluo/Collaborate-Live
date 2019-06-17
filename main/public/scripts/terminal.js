const terminal = document.getElementById('terminal');
const terminalContainer = document.getElementById('terminal-container');
const terminalUsernameInput = document.getElementById('terminal-username-input');
const terminalPasswordInput = document.getElementById('terminal-password-input');
const $terminalUsernameInput = $('#terminal-username-input');
const $terminalPasswordInput = $('#terminal-password-input');
const $terminalTypeInput = $('#terminal-type-input');
const $terminalHostInput = $('#terminal-host-input');
const $terminalPortInput = $('#terminal-port-input');
const $terminalLoginDiv = $('#terminal-login');
const $terminalContainer = $('#terminal-container');
const $terminalLoading = $('#terminal-loading');
const $terminal = $('#terminal');
const $window = $(window);

var term = new Terminal({
  cursorBlink: true,
});

// Browser -> Backend
term.on("data", function(data) {
  socket.emit("terminal input", data);
});

// Backend -> Browser
socket.on("terminal output", function(data) {
  term.write(data);
});

socket.on("disconnect", function() {
  term.write("\r\n*** Disconnected from backend ***\r\n");
  hideTerminal();
});


socket.on('terminal connection', data => {
  if(data.error) {
    console.log("terminal connection received error");
    alertTerminalError(data.message);
    hideTerminal();
  } else {
    console.log("terminal connection received success");
    showTerminal();
  }
});

const hideTerminal = () => {
  setTimeout(() => {
    $terminalLoading.hide();
    $terminalContainer.hide();
    $terminal.hide();
    $terminalLoginDiv.fadeIn();
    console.log("attempt to dispose");
    // term.dispose();
    // term = null;
  }, 1000);
}

const showTerminal = () => {
  $terminalLoginDiv.hide();
  $terminalContainer.fadeIn();
  term.open(terminal);
  term.fit();
  $terminal.show();
  term.focus();
}

const alertTerminalError = message => {
  alert("terminal error: " + message)
}

$window.keydown(event => {
 // When the client hits ENTER on their keyboard
 if(event.which === 13) {
   if(document.activeElement === terminalUsernameInput
   || document.activeElement === terminalPasswordInput) {
     $terminalLoading.fadeIn();
     attemptConnection();
   }
 }// enter
 return;// dont remove, otherwise other key down event will not be triggered
});

const attemptConnection = () => {
  var type = cleanInput($terminalTypeInput.val().trim());
  var host = cleanInput($terminalHostInput.val().trim());
  var port = cleanInput($terminalPortInput.val().trim());
  var username = cleanInput($terminalUsernameInput.val().trim());
  var password = cleanInput($terminalPasswordInput.val().trim());
  socket.emit('connect shell', {
    type: type,
    host: host,
    port: port,
    username: username,
    password: password
  });
}

// Prevents input from having injected markup
const cleanInput = (input) => {
  return $('<div/>').text(input).html();
}
