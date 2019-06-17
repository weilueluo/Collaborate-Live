$(function() {
  var $execute = $('#execute-code');
  var $output = $('#coding-output-area');
  $execute.click(() => {
    var usercode = firepad.getText();
    var userArgs = $('#coding-input-area').val();
    var userInput = $('#coding-input-std').val();
    $output.val("waiting for output...");
    socket.emit('execute', {
      code: usercode,
      args: userArgs,
      stdInput: userInput
    });
  });

  socket.on('execute result', (data) => {
    $output.val(data.error || data.output);
  });

})
