const {
  getDimensions,
  BYTE_COMPARERS,
  areBuffersEqual,
  getResizedBitmap,
  extractBitmapAndChannelCount,
  MIMES,
} = require("./lib");

module.exports = {
  compare: async (buffer1, buffer2) => {
    const isInterformatComparison =
      buffer1[0] === MIMES.WEBP && buffer1[0] !== buffer2[0];

    if (isInterformatComparison) {
      throw new Error("Interformat webp comparison not supported");
    }

    return areBuffersEqual(
      ...(await Promise.all([compareImpl(buffer1), compareImpl(buffer2)])),
      BYTE_COMPARERS[buffer1[0]],
      BYTE_COMPARERS[buffer2[0]],
      buffer1[0]
    );
  },
};

const compareImpl = async (buffer) => {
  const { width, height } = getDimensions[buffer[0]](buffer);

  const { channels, data: bitmap } = await extractBitmapAndChannelCount(buffer);

  return await getResizedBitmap(width, height, channels, bitmap);
};
