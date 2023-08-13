// https://github.com/image-size/image-size/blob/08389eb1d6804485a3ae5964dfe827df885b0c54/lib/types/utils.ts

const decoder = new TextDecoder();

const toUTF8String = (input, start = 0, end = input.length) =>
  decoder.decode(input.slice(start, end));

const toHexString = (input, start = 0, end = input.length) =>
  input
    .slice(start, end)
    .reduce((memo, i) => memo + ("0" + i.toString(16)).slice(-2), "");

module.exports = {
  toHexString,
  toUTF8String,
};
