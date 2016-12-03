/**
 * wg-thumbs - Thumbs generation unit tests
 */
// (C) Alexandre Morin 2015 - 2016

const assert = require('assert');
const fs = require('fs');

const Log = require('wg-log').Log;

const Thumbs = require('../lib/thumbs.js');

Log.configure('wg::thumbs', { level:'debug' });

function checkThumb(fileName, expected, callback) {
  var thumb = {size:80};
  return Thumbs.generateThumbnail(__dirname + '/data/' + fileName, '/tmp/wg-thumbs-' + fileName, thumb, function(err, exif) {
    if (err) return callback(err);
    return callback();
  });  
}

describe('Thumbs', function() {

  it('Check Thumbs tags', function(done) {
    return checkThumb('00001.jpg', undefined, function() {
      return done();
    });
  });

});

