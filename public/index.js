(function (window, document, undefined) {

  var socket = io('http://localhost:3000'),
      fileInput = document.getElementById('fileInput');
  var heartBtns = null,
      heartBtnsLen = null;

  // functions
  var addNewImage = null,
      handleNewFile = null,
      likeEvent = null,
      createPicInfo = null,
      incrementLikeLabel = null;

  addNewImage = function(data, event) {

    if (!data) {
      data = {
        likes: 0,
        src: event.target.result
      };
    }

    // TODO: use a template engine
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

  handleNewFile = function() {
    var fileReader = new FileReader();

    fileReader.readAsDataURL(this.files[0]);

    fileReader.onload = function (event) {

      var newImg = addNewImage(null, event);

      socket.emit('new image', newImg.src);

      newImg = null;
    }
  };

  likeEvent = function(event) {

    if (!this.classList.contains('full')) {

      // this refers to the heart button that was clicked
      this.classList.remove('empty');
      this.classList.add('full');

      var likeLabel = this.parentElement.firstElementChild;

      incrementLikeLabel(likeLabel);

      socket.emit('liked pic', this.parentElement.parentElement.firstElementChild.src);

      likeLabel = null;
    }
  };

  createPicInfo = function(likes) {
    var labelLikes = document.createElement('span'),
        heart = document.createElement('button'),
        infoDiv = document.createElement('div');

    labelLikes.classList.add('likes');
    if (likes) {
      incrementLikeLabel(labelLikes, likes);
    }

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
     * but by getting the picture by its source it can happen (I guess so)
     */
    var pic = document.querySelector('img[src="' + likedPic.src + '"]');

    var likeLabel = pic.nextSibling.firstChild;

    incrementLikeLabel(likeLabel);

    likeLabel = null;
    pic = null;

    console.log('some user just liked a image!');
  });

  socket.on('all pics', function (pics) {
    if (pics) {
      for (var i = 0; i < pics.length; i++) {
        addNewImage(pics[i]);
      }
    }
  })

  heartBtns = document.querySelectorAll('.heart');
  heartBtnsLen = heartBtns.length;
  for (var i = 0; i < heartBtnsLen; i++) {
    heartBtns[i].addEventListener('click', likeEvent);
  }

}(window, document));
