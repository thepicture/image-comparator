const {
  MIMES,
  MODES,
  getDimensions,
  BYTE_COMPARERS,
  areBuffersEqual,
  getResizedBitmap,
  extractBitmapAndChannelCount,
} = require("./lib");

module.exports = {
  compare: async (buffer1, buffer2, options = {}) => {
    const isInterformatComparison =
      buffer1[0] === MIMES.WEBP && buffer1[0] !== buffer2[0];

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

    if (isInterformatComparison) {
      throw new Error("Interformat webp comparison not supported");
    }

    return (
      areBuffersEqual(
        ...(await Promise.all([compareImpl(buffer1), compareImpl(buffer2)])),
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
            .some(Boolean))
      )
    );
  },
  MODES,
};

const compareImpl = async (buffer) => {
  const { width, height } = getDimensions[buffer[0]](buffer);

  const { channels, data: bitmap } = await extractBitmapAndChannelCount(buffer);

  return await getResizedBitmap(width, height, channels, bitmap);
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
