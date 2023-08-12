const Resize = require("./Resize");
const { readUInt32BE } = require("./readers");
const { toUTF8String } = require("./formatters");
const { MIMES, pngFriedChunkName } = require("./enums");

const getDimensions = {
  [MIMES.PNG]: (input) => {
    if (toUTF8String(input, 12, 16) === pngFriedChunkName) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32),
      };
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16),
    };
  },
};

const getResizedBitmap = (width, height, channelCount, bitmap) =>
  new Promise((resolve) => {
    const resize = new Resize(
      width,
      height,
      2,
      2,
      channelCount === 4,
      false,
      resolve
    );
    resize.resize(bitmap);
  });

module.exports = {
  getDimensions,
  getResizedBitmap,
};
