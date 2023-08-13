const {
  getDimensions,
  BYTE_COMPARERS,
  areBuffersEqual,
  getResizedBitmap,
  extractBitmapAndChannelCount,
} = require("./lib");

module.exports = {
  compare: async (buffer1, buffer2) => {
    const magicOfBuffer1 = buffer1.at(0);
    const magicOfBuffer2 = buffer2.at(0);

    const { width: width1, height: height1 } =
      getDimensions[magicOfBuffer1](buffer1);
    const { width: width2, height: height2 } =
      getDimensions[magicOfBuffer2](buffer2);

    const { channels: channels1, data: bitmap1 } =
      await extractBitmapAndChannelCount(buffer1);
    const { channels: channels2, data: bitmap2 } =
      await extractBitmapAndChannelCount(buffer2);

    const resizedBitmap1 = await getResizedBitmap(
      width1,
      height1,
      channels1,
      bitmap1
    );
    const resizedBitmap2 = await getResizedBitmap(
      width2,
      height2,
      channels2,
      bitmap2
    );

    return areBuffersEqual(
      resizedBitmap1,
      resizedBitmap2,
      BYTE_COMPARERS[magicOfBuffer1],
      BYTE_COMPARERS[magicOfBuffer2]
    );
  },
};
