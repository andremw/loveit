(function (window, document, undefined) {

  var socket = io('http://localhost:3000'),
      fileInput = document.getElementById('fileInput');

  function handleNewFile() {
    var fileReader = new FileReader();

    fileReader.readAsDataURL(this.files[0]);

    fileReader.onload = function (event) {

      var newImg = addNewImage(null, event);

      socket.emit('new image', newImg.src);
    }
  }

  function addNewImage(data, event) {
    data = data || event.target.result;

    // TODO: use a template engine
    var picsSection = document.getElementById('pictures-box');
    var newImg = document.createElement('img');
    var newPicSection = document.createElement('section');

    newImg.classList.add('picture-preview');
    newImg.src = data;

    newPicSection.appendChild(newImg);

    picsSection.insertBefore(newPicSection, picsSection.firstChild);

    return newImg;
  }

  fileInput.addEventListener('change', handleNewFile, false);

  socket.on('new image', function (data) {
    addNewImage(data, null);
  });

}(window, document));