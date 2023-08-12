const decoder = new TextDecoder();

// https://github.com/image-size/image-size/blob/08389eb1d6804485a3ae5964dfe827df885b0c54/lib/types/utils.ts#L2C1-L6C45
const toUTF8String = (input, start = 0, end = input.length) =>
  decoder.decode(input.slice(start, end));

module.exports = {
  toUTF8String,
};
