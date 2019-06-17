
'use strict';
//https://stackoverflow.com/questions/1801160/can-i-use-jquery-with-node-js
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
//jquery
var $ = require('jquery')(window);
//server
var nodeStatic = require('node-static');
var http = require('http');
//file
var fs = require('fs');
//terminal encoding
var utf8 = require("utf8");
// socket
var socket = require('socket.io');
//public directory
var staticBasePath = './public/';
//for terminal
var os = require('os');
var pty = require('node-pty');


// Listen on port 3000.
var port = 3000;
var fileServer = new(nodeStatic.Server)('public');
var app = http.createServer(function(req, res) {
  req.addListener('end', function () {
      fileServer.serve(req, res);
  }).resume();
});

var ip, server, io;
//attempt to retrieve ip using api
$.getJSON('https://json.geoiplookup.io', function(data) {

ip = data.ip || 'localhost';
server = app.listen(port, ip);
console.log("server on " + ip + ":" + port);
io = socket(server);

// Keeps track of messages going in and out.

var rooms = {};
var chatrooms = {};
var canvasrooms = {};

/////////////////////////////////////////////////////////////////////////////

io.on('connection', (socket) => {
  console.log("new connection: " + socket.id);
  var chatroom_addedUser = false;
  var room_addedUser = false;

  let room;

  socket.on('join or create', (roomhash, joinedExistingRoom) => {
    room = roomhash;
    console.log("room: " + room);
    socket.join(room);

    if(rooms[room]) {
      console.log("joined existing room: " + roomhash);
      rooms[room]++;
      joinedExistingRoom(true);
    } else {
      console.log("created new room: " + roomhash);
      rooms[room] = 1;
      joinedExistingRoom(false);
    }

    // restore canvas if exists
    // else create new one
    if(canvasrooms[room]) {
      socket.emit('restore canvas', canvasrooms[room]);
    } else {
      canvasrooms[room] = [];
    }
    room_addedUser = true;
  });

  //drawing pad///////////////////////////////////////////
  socket.on('drawing', data => {
    socket.to(room).emit('drawing', data);
    if(canvasrooms[room]) {
      canvasrooms[room].push(data);
    }
  });

  socket.on('send line', data => {
    socket.to(room).emit('receive line', data);
  });

  socket.on('temp line', data => {
    socket.to(room).emit('temp line', data);
  });

  socket.on('clear canvas', () => {
    io.in(room).emit('clear canvas');
    canvasrooms[room] = [];
  })

  /////chat room///////////////////////////////////////////
  socket.on('new message', (data) => {
    socket.to(room).emit('new message', {
      username: socket.username,
      message: data
    });
  });

  socket.on('add user', (username) => {
    if(chatroom_addedUser) {
      return;
    }
    socket.username = username;
    if(chatrooms[room]) {
      chatrooms[room]++;
    } else {
      chatrooms[room] = 1;
    }
    chatroom_addedUser = true;
    socket.emit('login', {
      numUsers: chatrooms[room]
    });
    socket.to(room).emit('user joined', {
      username: socket.username,
      numUsers: chatrooms[room]
    });

  });

  socket.on('typing', () => {
    socket.to(room).emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', () => {
    socket.to(room).emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', () => {
    if(room_addedUser) {
      rooms[room]--;
      if(rooms[room] == 0) {
        delete rooms[room];
      }
    }
    if (chatroom_addedUser) {
      chatrooms[room]--;
      socket.to(room).emit('user left', {
        username: socket.username,
        numUsers: chatrooms[room]
      });
      console.log('Lost connection: ' + socket.id);
    }
  });

  //terminal///////////////////////////////////////////////////////////
  var SSHClient = require("ssh2").Client;
  var utf8 = require("utf8");
  var terminal;
  socket.on('connect shell', data => {
    if(data.type === 'server') {
      initializeServerTerminal({
        username: data.username,
        password: data.password
      });
    } else {
      initializeLocalTerminal();
    }
  });

  var ptyProcess;
  const initializeLocalTerminal = () => {
    console.log("attempt local connection");
    var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    ptyProcess = pty.spawn(shell, [], {
      cwd: 'terminals',
      env: process.env
    });

    ptyProcess.on('data', function(data) {
      socket.emit('local terminal output', data);
    });

    socket.on('local terminal input', data => {
      ptyProcess.write(data);
    });
  }

  const initializeServerTerminal = data => {
    var ssh = new SSHClient();
    ssh.on("ready", () => {
      console.log("ssh connected");
      socket.emit('terminal connection', {
        error: false
      });
      ssh.shell((err, stream) => {
        if (err) {
          socket.emit('terminal output', 'ssh shell error: ' + err.message);
          return;
        }
        socket.on("terminal input", (data) => {
          stream.write(data);
        });
        stream.on("data", (d) => {
          socket.emit("terminal output", utf8.decode(d.toString("binary")));
        }).on("close", () => {
          ssh.end();
        });
      });

    }).on("close", () => {
      socket.emit('terminal connection', {
        error: true,
        message: 'SSH CONNECTION CLOSED'
      });
    }).on("error", (err) => {
      console.log(err);
      socket.emit('terminal connection', {
        error: true,
        message: err.message
      });
    }).connect({
      host: data.host || undefined,
      port: data.port || 22, // Generally 22
      username: data.username || undefined,
      password: data.password || undefined

      //NOTE TODO ALLOW USER UPLOAD PRIVATEKEY IF THEY TRUST US
      //privateKey: require("fs").readFileSync("PATH OF KEY ")
    });
  }




  //compiler///////////////////////////////////////////////////////////

  socket.on('execute', (data) => {

    console.log("server received code : \n" + data.code);

    const execSync = require('child_process').execSync;
    var fileType = '.java';
    var fileName = 'Run';
    var classPath = "public/code/";
    var options = "-cp " + classPath;
    var compileFile = classPath + fileName + fileType;
    var executeFile = classPath + fileName;
    var executeOutput;
    fs.writeFile( compileFile, data.code, function(err) {
      if(err) {
        executeOutput = {
          output: null,
          error: "server encountered a problem while writing file, please try again later"
        }
        console.log(err);
      } else {
        // import { execSync } from 'child_process';  // replace ^ if using ES modules
        try {
          console.log("compiling " + compileFile);
          const compile = execSync('javac ' + compileFile, { encoding: 'utf-8' });
          console.log("executing " + executeFile);
          const result = execSync('java ' + options + ' ' + fileName + ' ' + data.args,
          {
            encoding: 'utf-8',
            input: data.stdInput
          });
          console.log('Output is:\n', result);
          executeOutput = {
            output: result,
            error: compile
          };
        } catch (err) {
          executeOutput = {
              output: null,
              error: err.toString()
          };
        }
      }
      io.in(room).emit('execute result', executeOutput);
    });
  });

  //video/////////////////////////////////////////////////////////////
  // NOTE TODO
  // var os = require('os');
  //
  // function log() {
  //   var array = ['Message from server:'];
  //   array.push.apply(array, arguments);
  //   socket.emit('log', array);
  // }
  //
  // socket.on('message', function(message) {
  //   log('Client said: ', message);
  //   // for a real app, would be room-only (not broadcast)
  //   socket.emit('message', message);
  // });
  //
  // socket.on('create or join', function(room) {
  //   log('Received request to create or join room ' + room);
  //
  //   var clientsInRoom = io.sockets.adapter.rooms[room];
  //   var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
  //   log('Room ' + room + ' now has ' + numClients + ' client(s)');
  //
  //   if (numClients === 0) {
  //     socket.join(room);
  //     log('Client ID ' + socket.id + ' created room ' + room);
  //     socket.emit('created', room, socket.id);
  //   } else if (numClients === 1) {
  //     log('Client ID ' + socket.id + ' joined room ' + room);
  //     // io.sockets.in(room).emit('join', room);
  //     socket.join(room);
  //     socket.emit('joined', room, socket.id);
  //     io.sockets.in(room).emit('ready', room);
  //     socket.emit('ready', room);
  //   } else { // max two clients
  //     socket.emit('full', room);
  //   }
  // });
  //
  // socket.on('ipaddr', function() {
  //   var ifaces = os.networkInterfaces();
  //   for (var dev in ifaces) {
  //     ifaces[dev].forEach(function(details) {
  //       if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
  //         socket.emit('ipaddr', details.address);
  //       }
  //     });
  //   }
  // });
  //
  // socket.on('disconnect', function(reason) {
  //   console.log(`Peer or server disconnected. Reason: ${reason}.`);
  //   socket.emit('bye');
  // });
  //
  // socket.on('bye', function(room) {
  //   console.log(`Peer said bye on room ${room}.`);
  // });



  ////////////////////////////////////////////////////////////////////////////
  // rooms.html //////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////

  socket.on('get rooms', res => {
    let rooms_urls = [];
    let rooms_names = [];
    let rooms_numofusers = [];
    let rooms_urls_hashes = Object.keys(rooms);
    let length = 0;
    for(let i = 0; i < rooms_urls_hashes.length; i++) {
      rooms_urls.push("canvas.html#" + rooms_urls_hashes[i]);
      rooms_names.push("Room " + (i + 1));
      rooms_numofusers.push(rooms[rooms_urls_hashes[i]]);
      length++;
    }
    res({
      urls: rooms_urls,
      names: rooms_names,
      numofusers: rooms_numofusers,
      hashes: rooms_urls_hashes,
      length: length
    });
  });

});
});
