const $rooms_ul = $('#rooms-ul');

const refresh_rooms = () => {
  $rooms_ul.text("Refreshing...");
  socket.emit('get rooms', data => {
    let urls = data.urls;
    let names = data.names;
    let numofusers = data.numofusers;
    let length = data.length;
    let hashes = data.hashes;

    $rooms_ul.empty();
    if(!urls || !names || !numofusers || !hashes) {
      console.log("error, incomplete data");
    } else if(length == 0) {
      $rooms_ul.append(get_empty_li());
    } else {
      for(let i = 0; i < length; i++) {
        $rooms_ul.append(get_li(urls[i], names[i], hashes[i], numofusers[i]));
      } // for
    } // else
  });
}

const get_li = (url, name, hash, numofusers) => {
  return  '<li class="rooms-li hover-effect" onclick="location.href=\'' + url + '\';">'
        +   '<span class="room-name">' + name + '</span>'
        +   '<span class="hash">' + hash + '</span>'
        +   '<span class="num-of-users">' + numofusers + ' users</span>'
        + '</li>';
}

const get_empty_li = () => {
  return  '<li id="no-room-li">'
        +   '<span id="no-room-span">There is no room available for now</span>'
        + '</li>';
}

const update_rooms = () => {
  console.log("updating");
  socket.emit('get rooms', data => {
    let names = data.names;
    let numofusers = data.numofusers;
    let hashes = data.hashes;
    let length = data.length;

    let server_texts = [];
    let server_lis = [];

    for(let i = 0; i < length; i++) {
      server_texts.push(names[i] + hashes[i] + numofusers[i] + " users");
      server_lis.push(get_li(names[i], names[i], hashes[i], numofusers[i]));
    }


    let user_texts = [];
    let rooms = $('#rooms-ul li');
    let empty_text = $(get_empty_li()).text();
    rooms.each(function(index, room) {
      let user_text = $(room).text();
      user_texts.push(user_text);

      if(!server_texts.includes(user_text) && (user_text != empty_text || rooms.length > 1)) {
        remove_room(room);
      }
    });

    for(let i = 0; i < length; i++) {
      if(!user_texts.includes(server_texts[i])) {
        append_room(server_lis[i])
      }
    }

    if(length == 0 && rooms.length === 0) {
      append_room(get_empty_li());
    }
  });
}

const remove_room = room => {
  $(room).fadeOut(400, function() {
    $(this).remove();
  });
}

const append_room = room => {
  $rooms_ul.append(
    $(room).hide().fadeIn(400)
  );
}
