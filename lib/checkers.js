const { HIT_THRESHOLD, MIMES } = require("./enums");

// https://stackoverflow.com/a/21554107
const areBuffersEqual = (
  buffer1,
  buffer2,
  comparerOfBuffer1,
  comparerOfBuffer2,
  mime
) => {
  const view1 = new Int8Array(buffer1);
  const view2 = new Int8Array(buffer2);

  if (mime === MIMES.WEBP) {
    const total = 16;
    let hits = 0;

    for (let i = 0; i < total; i++) {
      if (
        comparerOfBuffer1(view1[i], view2[i]) ||
        comparerOfBuffer2(view1[i], view2[i])
      ) {
        hits++;
      }
    }

    return hits / total >= 0.7;
  }

  if (buffer1.byteLength != buffer2.byteLength) {
    let hits = 0;
    const total = Math.min(buffer1.byteLength, buffer2.byteLength);

    for (let i = 0; i < total; i++) {
      if (
        comparerOfBuffer1(view1[i], view2[i]) ||
        comparerOfBuffer2(view1[i], view2[i])
      ) {
        hits++;
      }
    }

    return hits / total >= HIT_THRESHOLD;
  }

  for (let i = 0; i < buffer1.byteLength; i++) {
    if (
      !comparerOfBuffer1(view1[i], view2[i]) &&
      !comparerOfBuffer2(view1[i], view2[i])
    ) {
      return false;
    }
  }

  return true;
};

module.exports = {
  areBuffersEqual,
};
