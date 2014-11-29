(function (window, document, undefined) {

  // the lib tries to connect to the socket, if it fails it keeps trying
  var socket = io('http://localhost:5000'),
      fileInput = document.getElementById('fileInput');

  var heartBtns = null,

      // the number of heart btns in the app (equal to the number of pics)
      heartBtnsLen = null;

  // functions
  var addNewImage = null,
      handleNewFile = null,
      likeEvent = null,
      createPicInfo = null,
      incrementLikeLabel = null;

  /**
   * Adds a new image to the page.
   * @param {object} data  An object that contains the number of likes the pic
   * has and the base64-encoded string that corresponds to the picture and
   * is used by the browser to render it. This parameter will be null when
   * the picture comes from the file input.
   *
   * @param {Event} The onload event. It will be null when the picture comes
   * from the server. When it's not null, we know that the picture has been
   * uploaded by the current user.
   *
   * TODO: use a template engine
   */
  addNewImage = function(data, event) {

    if (!data) {
      data = {
        likes: 0,
        src: event.target.result
      };
    }

    var picsSection = document.getElementById('pictures-boxes');
    var newImg = document.createElement('img');
    var newPicPreview = document.createElement('article');

    newImg.classList.add('preview');
    newImg.src = data.src;

    newPicPreview.classList.add('picture-box');
    newPicPreview.appendChild(newImg);
    newPicPreview.appendChild(createPicInfo(data.likes));


    picsSection.insertBefore(newPicPreview, picsSection.firstChild);

    return newImg;
  };

  /**
   * It handles a new file whenever the user uploads something in the file input.
   * Also sends an event to the server indicating that a new picture has been
   * uploaded, so that the server can broadcast it to every connected user.
   * @return {void}
   */
  handleNewFile = function() {
    var fileReader = new FileReader();

    fileReader.readAsDataURL(this.files[0]);

    fileReader.onload = function (event) {

      var newImg = addNewImage(null, event);

      // Here the event is sent to the server, passing the picture source
      socket.emit('new image', newImg.src);

      newImg = null;
    }
  };

  /**
   * It is executed whenever the user likes a picture. Then it sends an 'event'
   * to the server indicating that the picture has been liked, so that the server
   * can broadcast it to every connected user.
   * @param  {Event} event The click event
   * @return {void}
   */
  likeEvent = function(event) {

    // Avoid more than 1 like from the user to the same picture
    if (!this.classList.contains('full')) {

      this.classList.remove('empty');
      this.classList.add('full');

      var likeLabel = this.parentElement.firstElementChild;

      incrementLikeLabel(likeLabel);

      // Event sent to the server
      socket.emit('liked pic', this.parentElement.parentElement.firstElementChild.src);

      likeLabel = null;
    }
  };

  /**
   * The bar with the pic info is created. It's executed for every new picture
   * @param  {int} likes The number of likes the picture has.
   * @return {Div element} infoDiv The created DIV
   */
  createPicInfo = function(likes) {
    var labelLikes = document.createElement('span'),
        heart = document.createElement('button'),
        infoDiv = document.createElement('div');

    labelLikes.classList.add('likes');

    // If the picture already has a like (i.e., the picture comes from the server
    // and have been liked)
    if (likes) {
      incrementLikeLabel(labelLikes, likes);
    }

    // add a empty heart, because the current user has not yet liked it
    heart.classList.add('empty');
    heart.classList.add('heart');

    heart.addEventListener('click', likeEvent);

    infoDiv.classList.add('picture-info');
    infoDiv.appendChild(labelLikes);
    infoDiv.appendChild(heart);

    return infoDiv;
  };

  /**
   * Increment the number of likes by 1, if the numOfLikes is not specified
   * @param  {Span element} likeLabel  The element that shows the # of likes
   * @param  {int} numOfLikes The # of likes the image already have
   * @return {void}
   */
  incrementLikeLabel = function(likeLabel, numOfLikes) {
    if (!numOfLikes) {
      // get likes from 0 (null) to 999
      numOfLikes = likeLabel.textContent.match(/\d{3}|\d{2}|\d{1}/g);

      if (numOfLikes) {
        numOfLikes = parseInt(numOfLikes[0]);
        numOfLikes++;
      }

    }
    likeLabel.textContent = numOfLikes > 1 ? (numOfLikes + ' likes') : (1 + ' like');
  }

  fileInput.addEventListener('change', handleNewFile, false);

  /**
   * Whenever a new image is uploaded by other user, the server sends an event
   * to the client so that it can update the page
   * @param  {object} newImg The uploaded image
   * @return {void}
   */
  socket.on('new image', function (newImg) {
    addNewImage(newImg, null);
  });

  /**
   * For every picture that any other user likes, this method increment the
   * number of likes.
   * @param  {object} likedPic A object that contains attr. 'likes' and 'src'
   * @return {void}
   */
  socket.on('liked pic', function (likedPic) {

    /**
     * FIX: it shouldn't let duplicate images have its likes incremented as well,
     * but by getting the picture by its source it can happen (I guess so lol)
     */
    var pic = document.querySelector('img[src="' + likedPic.src + '"]');

    var likeLabel = pic.nextSibling.firstChild;

    incrementLikeLabel(likeLabel);

    likeLabel = null;
    pic = null;

  });

  /**
   * When the user connects to the server, the latter sends to the former all
   * the already uploaded pictures that are in memory
   * @param  {Array} pics An array with all the pictures already uploaded
   * @return {void}
   */
  socket.on('all pics', function (pics) {
    if (pics) {
      for (var i = 0; i < pics.length; i++) {
        addNewImage(pics[i]);
      }
    }
  });

  heartBtns = document.querySelectorAll('.heart');
  heartBtnsLen = heartBtns.length;
  // attach to every heart the click event
  for (var i = 0; i < heartBtnsLen; i++) {
    heartBtns[i].addEventListener('click', likeEvent);
  }

}(window, document));
