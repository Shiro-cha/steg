import Jimp from 'jimp';
import fs from 'fs';

const lsbEncode = (imagePath, message, outputImagePath) => {
  Jimp.read(imagePath, (err, image) => {
    if (err) throw err;
    const binaryMessage = strToBinary(message);
    let binaryIndex = 0;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      if (binaryIndex < binaryMessage.length) {
        const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
        let newR = r;
        let newG = g;
        let newB = b;

        newR = setLSB(newR, binaryMessage[binaryIndex]);
        binaryIndex++;
        newG = setLSB(newG, binaryMessage[binaryIndex]);
        binaryIndex++;
        newB = setLSB(newB, binaryMessage[binaryIndex]);
        binaryIndex++;

        const newColor = Jimp.rgbaToInt(newR, newG, newB, 255);
        image.setPixelColor(newColor, x, y);
      }
    });

    image.write(outputImagePath, () => {
      console.log('Message hidden in image');
    });
  });
};

const strToBinary = (str) => {
  return str.split('').map(char => char.charCodeAt(0).toString(2)).join('');
};

const setLSB = (value, bit) => {
  if (bit === '1') {
    return value ;
  } else {
    return value & 0b11111110;
  }
};

const binaryToStr = (binary) => {
  return binary.match(/.{8}/g).map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
};

const lsbDecode = (imagePath) => {
  Jimp.read(imagePath, (err, image) => {
    if (err) throw err;
    let binaryMessage = '';
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
      binaryMessage += getLSB(r);
      binaryMessage += getLSB(g);
      binaryMessage += getLSB(b);
    });
    const message = binaryToStr(binaryMessage);
    console.log('Hidden message:', message);
  });
};

const getLSB = (value) => {
  return (value & 1).toString();
};

// Example usage
const imagePath = 'original-image.jpg';
const message = 'I love Ariela';
const outputImagePath = 'steg-image.jpg';

lsbEncode(imagePath, message, outputImagePath);
lsbDecode(outputImagePath);
