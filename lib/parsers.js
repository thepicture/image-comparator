const Resize = require("./Resize");
const { MIMES } = require("./enums");
const parseJpg = require("./jpgparse");
const { WebPDecoder, WebPRiffParser } = require("./webpparse");
const { parse: parsePng } = require("./pngparse");

const parseMapper = {
  [MIMES.PNG]: (buffer) =>
    new Promise((resolve, reject) => {
      parsePng(buffer, (error, bitmap) => {
        if (error) {
          return reject(error);
        }

        resolve(bitmap);
      });
    }),
  [MIMES.JPG]: parseJpg,
  [MIMES.WEBP]: async (buffer) => {
    const {
      frames: [{ src_off: srcOff, src_size: srcSize }],
    } = WebPRiffParser(buffer, 0);

    const decoder = new WebPDecoder();
    const dimensions = { width: [], height: [] };
    return {
      data: decoder.WebPDecodeRGBA(
        buffer,
        srcOff,
        srcSize,
        dimensions.width,
        dimensions.height
      ),
      channels: 4,
    };
  },
};

const extractBitmapAndChannelCount = (buffer) => parseMapper[buffer[0]](buffer);

module.exports = {
  Resize,
  extractBitmapAndChannelCount,
};
