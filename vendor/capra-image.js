(function () {
  'use strict';

  function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error || new Error('Image read failed')); };
      reader.readAsDataURL(file);
    });
  }

  function loadImage(source) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error('Image decode failed')); };
      image.src = source;
    });
  }

  async function read(file, options) {
    var settings = options || {};
    var maxDimension = settings.maxDimension || 2000;
    var quality = settings.quality || 0.9;
    var source = await readAsDataURL(file);

    try {
      var image = await loadImage(source);
      var scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      var canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext('2d', { alpha: false }).drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', quality);
    } catch (error) {
      return source;
    }
  }

  function persist(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  window.CapraImage = { read: read, persist: persist };
})();
