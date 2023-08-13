const Resize = require("./Resize");
const { parse: parsePng } = require("./pngparse");
const parseJpg = require("./jpgparse");

const parseMapper = {
  [0x89]: (buffer) =>
    new Promise((resolve, reject) => {
      parsePng(buffer, (error, bitmap) => {
        if (error) {
          return reject(error);
        }

        resolve(bitmap);
      });
    }),
  [0xff]: parseJpg,
};

const extractBitmapAndChannelCount = (buffer) =>
  parseMapper[buffer.at(0)](buffer);

module.exports = {
  Resize,
  extractBitmapAndChannelCount,
};
