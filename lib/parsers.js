const Resize = require("./Resize");
const { parse } = require("./pngparse");

const extractBitmapChannelsWithData = (buffer) =>
  new Promise((resolve, reject) => {
    parse(buffer, (error, bitmap) => {
      if (error) {
        return reject(error);
      }

      resolve(bitmap);
    });
  });

module.exports = {
  Resize,
  extractBitmapChannelsWithData,
};
