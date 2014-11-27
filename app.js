var express = require('express'),
    app = express(),
    io = null,
    port = process.env.PORT || 3000,
    usernames = null,
    server = null,
    uploadedImages = null;

server = app.listen(port, function() {
  console.log('Server listening at port %d', port);
});

io = require('socket.io')(server);

// Routing
app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {

  // whenever a user uploads a new image
  socket.on('new image', function (data) {

    var newImg = uploadedImages[uploadedImages.indexOf(data)];
    if (newImg) {
      newImg.likes++;
    } else {
      newImg = {
        likes: data.likes,
        src: data.src
      };
      uploadedImages.unshift(newImg);
    }

  // must show all uploaded images to every new user
    // if (!uploadedImages) uploadedImages = [data];
    // else {
    //   if (uploadedImages.indexOf(data) === -1) {
    //     uploadedImages.push(data);
    //   }
    // }

    // send the image to all users
    socket.broadcast.emit('new image', data);

  });

});
