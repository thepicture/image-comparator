// github.com/image-size/image-size/blob/08389eb1d6804485a3ae5964dfe827df885b0c54/lib/types/utils.ts

const readUInt32BE = (input, offset = 0) =>
  input[offset] * 2 ** 24 +
  input[offset + 1] * 2 ** 16 +
  input[offset + 2] * 2 ** 8 +
  input[offset + 3];

const readUInt16BE = (input, offset = 0) =>
  input[offset] * 2 ** 8 + input[offset + 1];

const readInt16LE = (input, offset = 0) => {
  const val = input[offset] + input[offset + 1] * 2 ** 8;
  return val | ((val & (2 ** 15)) * 0x1fffe);
};

const readUInt = (input, bits, offset, isBigEndian) => {
  offset = offset || 0;
  const endian = isBigEndian ? "BE" : "LE";
  const methodName = "readUInt" + bits + endian;
  return methods[methodName](input, offset);
};

const readUInt24LE = (input, offset = 0) =>
  input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16;

module.exports = {
  readUInt,
  readInt16LE,
  readUInt24LE,
  readUInt32BE,
  readUInt16BE,
};
