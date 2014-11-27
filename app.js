var express = require('express'),
    app = express(),
    io = null,
    port = process.env.PORT || 3000,
    usernames = null,
    server = null,
    uploadedImages = null;

var findPicBySrc = function (src) {
  var len = uploadedImages.length,
      uploadedPic = null;

  for (var i = 0; i < len; i++) {
    uploadedPic = uploadedImages[i];
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

  // must show all uploaded images to every new user

  // whenever a user uploads a new image
  socket.on('new image', function (picDataSrc) {

    if (!uploadedImages) uploadedImages = [];

    var newImg = {
      likes: 0,
      src: picDataSrc
    };

    uploadedImages.unshift(newImg);

    // send the image to all users. No need to pass things other than pic src
    socket.broadcast.emit('new image', picDataSrc);

  });

  socket.on('liked pic', function(picDataSrc) {
    console.log('new pic liked!');

    var img = findPicBySrc(picDataSrc);
    if (img) {
      img.likes++;

      // need to pass the src and the likes so that the browser can update the #
      // of likes.
      // TODO: use ID to identify the images both in the browser and in the server
      socket.broadcast.emit('liked pic', img);
    }

  });

});