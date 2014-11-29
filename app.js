var express = require('express'),
    app = express(),
    io = null,
    port = 3000,
    usernames = null,
    server = null,
    uploadedPics = null;

/**
 * Try to find a picture by it's source (base64).
 * @param  {string} src A base64 encoded image
 * @return {}     [description]
 */
var findPicBySrc = function (src) {
  var len = uploadedPics.length,
      uploadedPic = null;

  for (var i = 0; i < len; i++) {
    uploadedPic = uploadedPics[i];
    if (uploadedPic.src === src) {
      return uploadedPic;
    }
  }
  return null;
}

server = app.listen(port, function() {
  console.log('Server listening at port %d', port);
});

io = require('socket.io')(server);

// Routing
app.use(express.static(__dirname + '/public'));

/**
 * The server listens to every new connection
 * @param  {object} socket The new user
 * @return {void}
 */
io.on('connection', function (socket) {

  // send all uploaded images to every new user
  socket.emit('all pics', uploadedPics);

  /**
   * Whenever a user uploads a new picture, the server will execute the anonymous
   * function, which will receive in its argument the src sent by the browser
   * @param  {string} picDataSrc A base64-encoded string
   * @return {void}
   */
  socket.on('new image', function (picDataSrc) {

    if (!uploadedPics) uploadedPics = [];

    var newImg = {
      likes: 0,
      src: picDataSrc
    };

    uploadedPics.push(newImg);

    // send the image to all users.
    socket.broadcast.emit('new image', newImg);

  });

  /**
   * Whenever a user likes a picture, the server will execute the function.
   * @param  {string} picDataSrc A base64-encoded string
   * @return {void}
   */
  socket.on('liked pic', function(picDataSrc) {

    var pic = findPicBySrc(picDataSrc);
    if (pic) {
      pic.likes++;

      // TODO: use ID to identify the images both in the browser and in the server
      /**
       * need to pass the src and the likes so that the browser can update the
       * # of likes.
       */
      socket.broadcast.emit('liked pic', pic);
    }

  });

});