# Image thumbnails generation

This is using the ImageMagick's ```convert``` and ```identify``` commands.

## Installation

	npm link wg-log
	npm link wg-utils
	npm install

## Usage

	const Thumbs = require('wg-thumbs');
	Thumbs.setup({ convert: '/usr/local/bin/convert' });

## Generate a thumbnail

	var src = '/tmp/elephant.png';
	var dst = '/tmp/thumb.png';
	var thumb = { size:256 };
	return Thumbs.generateThumbnail(src, dst, thumb, function(err) {
	  ...

Thumbnail parameters

<table>
<tr><td>size</td><td>number</td><td>For square thumbnails, thumbnail size (defaults to 256)</td></tr>
<tr><td>width</td><td>number</td><td>Width of generated thumbnail (unless size is set)</td></tr>
<tr><td>height</td><td>number</td><td>Height of generated thumbnail (unless size is set)</td></tr>
<tr><td>quality</td><td>number</td><td>Image thumbnail quality (0..100)</td></tr>
<tr><td>autoRotate</td><td>boolean</td><td>Automatically rotates image (defaults to true)</td></tr>
<tr><td>rotateDegrees</td><td>number</td><td>Force image rotation</td></tr>
</table>


## Generate a scaled version of the image

	var src = '/tmp/elephant.png';
	var dst = '/tmp/thumb.png';
	var thumb = { width:240, height:120 };
	return Thumbs.generateScaled(src, dst, thumb, function(err) {
	  ...

Thumbnail parameters

<table>
<tr><td>width</td><td>number</td><td>Width of generated thumbnail (unless size is set)</td></tr>
<tr><td>height</td><td>number</td><td>Height of generated thumbnail (unless size is set)</td></tr>
<tr><td>quality</td><td>number</td><td>Image thumbnail quality (0..100)</td></tr>
<tr><td>autoRotate</td><td>boolean</td><td>Automatically rotates image (defaults to true)</td></tr>
<tr><td>rotateDegrees</td><td>number</td><td>Force image rotation</td></tr>
</table>


## Determine the dominant color of an image
See http://superuser.com/questions/576949/getting-the-predominant-colour-in-an-image

	var src = '/tmp/elephant.png';
	return Thumbs.dominantColor(src, function(err, color) {
	  ...



## Generate a GIF animation

This function will generate GIF animation from a set of files.

	var src = [ '/tmp/elephant1.png','/tmp/elephant2.png', '/tmp/elephant3.png' ];
	var dst = '/tmp/elephant.gif';
	var thumb = { width:240, height:120 };
	return Thumbs.makeGIF(src, dst, 25, Date.now()/1000, function(err) {
	  ...

