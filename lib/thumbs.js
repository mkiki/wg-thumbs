/**
 * wg-thumbs - Thumbnails and miniature generation
 */
// (C) Alexandre Morin 2015 - 2016

const child_process = require('child_process');
const extend = require('extend');
const fs = require('fs');

const Log = require('wg-log').Log;
const Exception = require('wg-log').Exception;
const Utils = require('wg-utils');

const log = Log.getLogger("wg-thumbs");


/** ================================================================================
 * Setup module
 * ================================================================================ */

// Convert OS command
//var CONVERT = config.modules.photos.convertCommand || "convert";
var CONVERT = "convert";

function setup(settings) {
  CONVERT = settings.convert || CONVERT;
}


/** ================================================================================
  * Generate a (square) thumbnail
  * Thumbnails can be square or not. A thumbnail generated from a file has the following
  * characteristics:
  *    - will have the exact expected size (image will be cropped if necessary)
  *    - will maintain aspect ratio
  *
  * thumb.size            For square thumbnails, thumbnail size (defaults to 256)
  * thumb.width           For non square thumbnails
  * thumb.height          For non square thumbnails
  * thumb.quality         Thumbnail quality
  * thumb.autoRotate      Automatically rotates image (defaults to true)
  * thumb.rotateDegrees   Force image rotation
  *
  *
  * Example:
  * return thumbs.generateThumbnail('/Users/alex/Downloads/cite_maurice_thorez.jpg', '/Users/alex/Downloads/thumb.png', { size:256 }, function(err) {
  *   console.log(err);
  * });
  *
  * ================================================================================ */
function generateThumbnail(source, destination, thumb, callback) { 
  log.debug({ source:source, destination:destination, thumb:thumb}, "Generating thumbnail");
  var width = thumb.width || thumb.size || 256;
  var height = thumb.height || thumb.size || 256;
  var autoRotate = (thumb.autoRotate === undefined) ? true : !!thumb.autoRotate;
  var rotateDegrees = thumb.rotateDegrees || 0;
  var quality = thumb.quality || 90;

  var command = '';
  command += ' ' + CONVERT;
  command += ' "' + Utils.escapeFilenameForCommand(source) + '[0]"';
  command += ' -quality ' + quality;
  command += ' -thumbnail ' + width + 'x' + height + '^';
  command += ' -gravity center';
  command += ' -crop ' + width + 'x' + height + '+0+0';
  command += ' +repage';
  if (autoRotate)
    command += ' -auto-orient';
  else
    command += ' -rotate ' + rotateDegrees;
  //command += ' -colorspace RGB';
  command += ' "' + Utils.escapeFilenameForCommand(destination) + '"';

  var options = {
    encoding: 'utf8',
    timeout: 20000
  };

  log.debug({command:command}, "Command");
  child_process.exec(command, options, function(err, stdout, stderr) {
    return callback(err);
  });
};

/** ================================================================================
  * Generate a miniature fitting in w x h and respecting proportion
  *
  * thumb.width           Maximum width of scaled image
  * thumb.height          Maximum height of scaled image
  * thumb.quality         Scaled image quality
  * thumb.autoRotate      Automatically rotates image (defaults to true)
  * thumb.rotateDegrees   Force image rotation
  *
  *
  * Example:
  * return thumbs.generateScaled('/Users/alex/Downloads/cite_maurice_thorez.jpg', '/Users/alex/Downloads/scaled.png', { width:800, height:600 }, function(err) {
  *   console.log(err);
  * });
  *
  * ================================================================================ */
function generateScaled(source, destination, thumb, callback) {
  log.debug({ source:source, destination:destination, thumb:thumb}, "Generating scaled image");
  var width = thumb.width;
  var height = thumb.height;
  var autoRotate = (thumb.autoRotate === undefined) ? true : !!thumb.autoRotate;
  var rotateDegrees = thumb.rotateDegrees || 0;
  var quality = thumb.quality || 90;

  var command = '';
  command += ' ' + CONVERT;
  command += ' "' + Utils.escapeFilenameForCommand(source) + '[0]"';
  command += ' -quality ' + quality;
  command += ' -resize ' + width + 'x' + height;
  //command += ' -colorspace RGB';
  command += ' -format PNG';
  if( autoRotate )
    command += ' -auto-orient';
  else
    command += ' -rotate ' + rotateDegrees;
  command += ' "' + Utils.escapeFilenameForCommand(destination) + '"';

  var options = {
    encoding: 'utf8',
    timeout: 20000
  };

  log.debug({command:command}, "Command");
  child_process.exec(command, options, function(err, stdout, stderr) {
    return callback(err);
  });
};


/** ================================================================================
  * Generate a GIF animation
  * @param sourceFiles    is an array of file names to use (long filenames) 
  * @param destination    longName of the destination (GIF) file
  * @param delay          delay between images
  * @param dateTime       date+time to set (as exif DateTime attribute)
  * @param callback       return function
  * ================================================================================ */

function makeGIF(sourceFiles, destination, delay, dateTime, callback) {
  log.debug({ sourceFiles:sourceFiles, destination:destination, delay:delay, dateTime:dateTime}, "Generating GIF animation");
  var command = '';
  command += ' ' + CONVERT;
  command += ' -delay ' + delay;
  for (var i=0; i<sourceFiles.length; i++)
    command += ' "' + Utils.escapeFilenameForCommand(sourceFiles[i]) + '[0]"';
  command += ' -loop 0';
  command += ' "' + Utils.escapeFilenameForCommand(destination) + '"';

  var options = {
    encoding: 'utf8',
    timeout: 20000
  };

  log.debug({command:command}, "Command");
  return child_process.exec(command, options, function(err, stdout, stderr) {
    if (err) return callback(err);
    if (!dateTime) return callback();
    
    log.debug("Setting date+time");
    return fs.utimes(destination, dateTime, dateTime, function(err) {
      return callback(err);
    });

  });  
}


/** ================================================================================
  * Determine dominant color of an image
  * See http://superuser.com/questions/576949/getting-the-predominant-colour-in-an-image
  * 
  * @param longFilename   Name of the file for which to determine the color of
  * @param callback       Return function
  *                           err - return code / message
  *                           color - [r,g,b] array with dominant color, or null/undefined if not found
  * ================================================================================ */

function dominantColor(longFilenmae, callback) {
  log.debug({ longFilenmae:longFilenmae}, "Determining dominant color");
  var command = '';
  command += ' ' + CONVERT;
  command += ' "' + Utils.escapeFilenameForCommand(longFilenmae) + '[0]"';
  command += " -scale 1x1\\!";
  command += " -format '%[pixel:u]'";
  command += " info:-";

  var options = {
    encoding: 'utf8',
    timeout: 20000
  };

  log.debug({command:command}, "Command");
  child_process.exec(command, options, function(err, stdout, stderr) {
    if (err) return callback(err);
    var first = stdout.indexOf('(');
    var last = stdout.lastIndexOf(')');
    var result;
    if (first !== -1 && last !== -1) {
      var color = stdout.substring(first+1, last).split(',');
      if (color.length === 3) {
        result = [ parseInt(color[0], 10), parseInt(color[1], 10), parseInt(color[2], 10) ];
      }
    }
    if (!result) log.warn({command:command, stdout:stdout}, "Unexpected color result");
    return callback(null, result);
  });    
}


/** ================================================================================
  * Public interface
  * ================================================================================ */
module.exports = {
  setup:             setup,
  generateThumbnail: generateThumbnail,
  generateScaled:    generateScaled,
  makeGIF:           makeGIF,
  dominantColor:     dominantColor
};



