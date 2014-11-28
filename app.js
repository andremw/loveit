var express = require('express'),
    app = express(),
    io = null,
    port = process.env.PORT || 3000,
    usernames = null,
    server = null,
    uploadedPics = null;

var findPicBySrc = function (src) {
  var len = uploadedPics.length,
      uploadedPic = null;

  for (var i = 0; i < len; i++) {
    uploadedPic = uploadedPics[i];
    if (uploadedPic.src === src) {
      return uploadedPic;
    }
  }
}

server = app.listen(port, function() {
  console.log('Server listening at port %d', port);
});

io = require('socket.io')(server);

// Routing
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {

  // send all uploaded images to every new user
  socket.emit('all pics', uploadedPics);

  // whenever a user uploads a new image
  socket.on('new image', function (picDataSrc) {

    if (!uploadedPics) uploadedPics = [];

    var newImg = {
      likes: 0,
      src: picDataSrc
    };

    uploadedPics.push(newImg);

    // send the image to all users. No need to pass things other than pic src
    socket.broadcast.emit('new image', newImg);

  });

  socket.on('liked pic', function(picDataSrc) {

    var pic = findPicBySrc(picDataSrc);
    if (pic) {
      pic.likes++;

      // need to pass the src and the likes so that the browser can update the #
      // of likes.
      // TODO: use ID to identify the images both in the browser and in the server
      socket.broadcast.emit('liked pic', pic);
    }

  });

});