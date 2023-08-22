const {
  MODES,
  getDimensions,
  BYTE_COMPARERS,
  areBuffersEqual,
  getResizedBitmap,
  extractBitmapAndChannelCount,
} = require("./lib");

module.exports = {
  compare: async (buffer1, buffer2, options = {}) => {
    if (typeof options === "function") {
      console.warn(
        `Third argument as function deprecated. 
Update your code to use third argument 
as object with compareFunction property instead`
      );

      options = {
        compareFunction: options,
      };
    }

    const [bitmap1, bitmap2] = await Promise.all([
      compareImpl(buffer1),
      compareImpl(buffer2),
    ]);

    return (
      areBuffersEqual(
        bitmap1,
        bitmap2,
        options.compareFunction || BYTE_COMPARERS[buffer1[0]],
        options.compareFunction || BYTE_COMPARERS[buffer2[0]],
        buffer1[0]
      ) ||
      !!(
        (options.modes & MODES.CHECK_GRAYSCALE &&
          areBuffersEqual(
            ...(await Promise.all([
              grayscaleCompareImpl(buffer1),
              grayscaleCompareImpl(buffer2),
            ])),
            (byte1, byte2) => Math.abs(byte1 - byte2) < 32,
            (byte1, byte2) => Math.abs(byte1 - byte2) < 32,
            buffer1[0]
          )) ||
        (options.modes & MODES.CHECK_HUE &&
          new Array(254)
            .fill(null)
            .map((_, index) => {
              const huedBuffer = new Uint8Array(
                Array.from(buffer1).map((byte) => byte + index + 1)
              );

              return areBuffersEqual(
                huedBuffer,
                buffer2,
                BYTE_COMPARERS[buffer1[0]],
                BYTE_COMPARERS[buffer2[0]],
                buffer1[0]
              );
            })
            .some(Boolean)) ||
        (options.modes & MODES.CHECK_INVERSION &&
          areBuffersEqual(
            bitmap1,
            bitmap2.map(inverseByte),
            BYTE_COMPARERS[buffer1[0]],
            BYTE_COMPARERS[buffer2[0]],
            buffer1[0]
          )) ||
        (options.modes & MODES.CHECK_ROTATION &&
          JSON.parse(JSON.stringify([...bitmap1]))
            .sort((a, b) => (a - b > 0 ? 1 : -1))
            .join() ===
            JSON.parse(JSON.stringify([...bitmap2]))
              .sort((a, b) => (a - b > 0 ? 1 : -1))
              .join())
      )
    );
  },
  MODES,
};

const compareImpl = async (buffer) => {
  const { width, height } = getDimensions[buffer[0]](buffer);

  const { channels, data: bitmap } = await extractBitmapAndChannelCount(buffer);

  const resizedBitmap = await getResizedBitmap(width, height, channels, bitmap);

  const isRGB = resizedBitmap.length === 12;

  if (isRGB) {
    // https://github.com/TomasHubelbauer/rgb-to-rgba
    const rgba = new Uint8ClampedArray((resizedBitmap.length / 3) * 4);

    for (let index = 0; index < rgba.length; index++) {
      if (index % 4 === 3) {
        rgba[index] = 255;
      } else {
        rgba[index] = resizedBitmap[~~(index / 4) * 3 + (index % 4)];
      }
    }

    return rgba;
  }

  return resizedBitmap;
};

const grayscaleCompareImpl = async (buffer) => {
  const { width, height } = getDimensions[buffer[0]](buffer);

  const { channels, data: bitmap } = await extractBitmapAndChannelCount(buffer);

  const grayscaleBuffer = new Uint8Array(bitmap.length);

  for (let i = 0; i < bitmap.length; i += channels) {
    const averageRgbColor = (bitmap[i] + bitmap[i + 1] + bitmap[i + 2]) / 3;
    grayscaleBuffer[i] = averageRgbColor;
    grayscaleBuffer[i + 1] = averageRgbColor;
    grayscaleBuffer[i + 2] = averageRgbColor;
  }

  return await getResizedBitmap(width, height, channels, bitmap);
};

const inverseByte = (byte, index) => (index % 4 === 3 ? byte : 255 - byte);
