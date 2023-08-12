// https://stackoverflow.com/a/21554107
const areBuffersEqual = (buffer1, buffer2) => {
  if (buffer1.byteLength != buffer2.byteLength) {
    return false;
  }

  const view1 = new Int8Array(buffer1);
  const view2 = new Int8Array(buffer2);

  for (let i = 0; i !== buffer1.byteLength; i++) {
    if (view1[i] != view2[i]) {
      return false;
    }
  }

  return true;
};

module.exports = {
  areBuffersEqual,
};
