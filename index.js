const {
  getDimensions,
  BYTE_COMPARERS,
  areBuffersEqual,
  getResizedBitmap,
  extractBitmapAndChannelCount,
} = require("./lib");

module.exports = {
  compare: async (buffer1, buffer2) =>
    areBuffersEqual(
      ...(await Promise.all([compareImpl(buffer1), compareImpl(buffer2)])),
      BYTE_COMPARERS[buffer1.at(0)],
      BYTE_COMPARERS[buffer2.at(0)]
    ),
};

const compareImpl = async (buffer) => {
  const { width, height } = getDimensions[buffer.at(0)](buffer);

  const { channels, data: bitmap } = await extractBitmapAndChannelCount(buffer);

  return await getResizedBitmap(width, height, channels, bitmap);
};
