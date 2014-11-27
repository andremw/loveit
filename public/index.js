(function (window, document, undefined) {

  var socket = io('http://localhost:3000'),
      fileInput = document.getElementById('fileInput');
  var heartBtns = null,
      heartBtnsLen = null;

  // functions
  var addNewImage = null,
      handleNewFile = null,
      likeEvent = null,
      createPicInfo = null;

  addNewImage = function(data, event) {
    data = data || event.target.result;

    // TODO: use a template engine
    var picsSection = document.getElementById('pictures-boxes');
    var newImg = document.createElement('img');
    var newPicPreview = document.createElement('article');

    newImg.classList.add('preview');
    newImg.src = data;

    newPicPreview.classList.add('picture-box');
    newPicPreview.appendChild(newImg);
    newPicPreview.appendChild(createPicInfo());


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
    // this refers to the heart button that was clicked
    this.classList.remove('empty');
    this.classList.add('full');

    var likeLabel = this.parentElement.firstElementChild;

    // get likes from 0 (null) to 999
    var numOfLikes = likeLabel.textContent.match(/\d{3}|\d{2}|\d{1}/g);

    if (numOfLikes) {
      numOfLikes = parseInt(numOfLikes[0]);
      numOfLikes++;
    }

    socket.emit('liked pic', this.parentElement.parentElement.firstElementChild.src);
  };

  createPicInfo = function() {
    var labelLikes = document.createElement('span'),
        heart = document.createElement('button'),
        infoDiv = document.createElement('div');

    labelLikes.classList.add('likes');
    heart.classList.add('empty');
    heart.classList.add('heart');

    heart.addEventListener('click', likeEvent);

    infoDiv.classList.add('picture-info');
    infoDiv.appendChild(labelLikes);
    infoDiv.appendChild(heart);

    return infoDiv;
  };

  fileInput.addEventListener('change', handleNewFile, false);

  socket.on('new image', function (data) {
    addNewImage(data, null);
  });

  heartBtns = document.querySelectorAll('.heart');
  heartBtnsLen = heartBtns.length;
  for (var i = 0; i < heartBtnsLen; i++) {
    heartBtns[i].addEventListener('click', likeEvent);
  }

}(window, document));
