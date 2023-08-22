const {
  MIMES,
  EXIF_MARKER,
  WIDTH_TO_RESIZE,
  IDF_ENTRY_BYTES,
  HEIGHT_TO_RESIZE,
  PNG_FRIED_CHUNK_NAME,
  EXIF_HEADER_BYTES,
  APP1_DATA_SIZE_BYTES,
  TIFF_BYTE_ALIGN_BYTES,
  BIG_ENDIAN_BYTE_ALIGN,
  LITTLE_ENDIAN_BYTE_ALIGN,
  NUM_DIRECTORY_ENTRIES_BYTES,
} = require("./enums");
const Resize = require("./Resize");
const { toUTF8String, toHexString } = require("./formatters");
const {
  readUInt32BE,
  readUInt,
  readUInt16BE,
  readInt16LE,
  readUInt24LE,
} = require("./readers");

function isEXIF(input) {
  return toHexString(input, 2, 6) === EXIF_MARKER;
}

function extractSize(input, index) {
  return {
    height: readUInt16BE(input, index),
    width: readUInt16BE(input, index + 2),
  };
}

function extractOrientation(exifBlock, isBigEndian) {
  // TODO: assert that this contains 0x002A
  // let STATIC_MOTOROLA_TIFF_HEADER_BYTES = 2
  // let TIFF_IMAGE_FILE_DIRECTORY_BYTES = 4

  // TODO: derive from TIFF_IMAGE_FILE_DIRECTORY_BYTES
  const idfOffset = 8;

  // IDF osset works from right after the header bytes
  // (so the offset includes the tiff byte align)
  const offset = EXIF_HEADER_BYTES + idfOffset;

  const idfDirectoryEntries = readUInt(exifBlock, 16, offset, isBigEndian);

  for (
    let directoryEntryNumber = 0;
    directoryEntryNumber < idfDirectoryEntries;
    directoryEntryNumber++
  ) {
    const start =
      offset +
      NUM_DIRECTORY_ENTRIES_BYTES +
      directoryEntryNumber * IDF_ENTRY_BYTES;
    const end = start + IDF_ENTRY_BYTES;

    // Skip on corrupt EXIF blocks
    if (start > exifBlock.length) {
      return;
    }

    const block = exifBlock.slice(start, end);
    const tagNumber = readUInt(block, 16, 0, isBigEndian);

    // 0x0112 (decimal: 274) is the `orientation` tag ID
    if (tagNumber === 274) {
      return readUInt(block, 16, 8, isBigEndian);
    }
  }
}

function validateExifBlock(input, index) {
  // Skip APP1 Data Size
  const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index);

  // Consider byte alignment
  const byteAlign = toHexString(
    exifBlock,
    EXIF_HEADER_BYTES,
    EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES
  );

  // Ignore Empty EXIF. Validate byte alignment
  const isBigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
  const isLittleEndian = byteAlign === LITTLE_ENDIAN_BYTE_ALIGN;

  if (isBigEndian || isLittleEndian) {
    return extractOrientation(exifBlock, isBigEndian);
  }
}

function calculateExtended(input) {
  return {
    height: 1 + readUInt24LE(input, 7),
    width: 1 + readUInt24LE(input, 4),
  };
}

function calculateLossless(input) {
  return {
    height:
      1 +
      (((input[4] & 0xf) << 10) | (input[3] << 2) | ((input[2] & 0xc0) >> 6)),
    width: 1 + (((input[2] & 0x3f) << 8) | input[1]),
  };
}

function calculateLossy(input) {
  // `& 0x3fff` returns the last 14 bits
  // TO-DO: include webp scaling in the calculations
  return {
    height: readInt16LE(input, 8) & 0x3fff,
    width: readInt16LE(input, 6) & 0x3fff,
  };
}

const getDimensions = {
  // https://github.com/image-size/image-size/blob/08389eb1d6804485a3ae5964dfe827df885b0c54/lib/types/png.ts#L25
  [MIMES.PNG]: (input) => {
    if (toUTF8String(input, 12, 16) === PNG_FRIED_CHUNK_NAME) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32),
      };
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16),
    };
  },
  // https://github.com/image-size/image-size/blob/08389eb1d6804485a3ae5964dfe827df885b0c54/lib/types/jpg.ts#L117
  [MIMES.JPG]: (input) => {
    // Skip 4 chars, they are for signature
    input = input.slice(4);

    let orientation;
    let next;
    while (input.length) {
      // read length of the next block
      const i = readUInt16BE(input, 0);

      if (isEXIF(input)) {
        orientation = validateExifBlock(input, i);
      }

      // 0xFFC0 is baseline standard(SOF)
      // 0xFFC1 is baseline optimized(SOF)
      // 0xFFC2 is progressive(SOF2)
      next = input[i + 1];
      if (next === 0xc0 || next === 0xc1 || next === 0xc2) {
        const size = extractSize(input, i + 5);

        // TODO: is orientation=0 a valid answer here?
        if (!orientation) {
          return size;
        }

        return {
          height: size.height,
          orientation,
          width: size.width,
        };
      }

      // move to the next block
      input = input.slice(i + 2);
    }
  },
  // https://github.com/image-size/image-size/blob/08389eb1d6804485a3ae5964dfe827df885b0c54/lib/types/webp.ts#L38
  [MIMES.WEBP]: (input) => {
    const chunkHeader = toUTF8String(input, 12, 16);
    input = input.slice(20, 30);

    // Extended webp stream signature
    if (chunkHeader === "VP8X") {
      return calculateExtended(input);
    }

    // Lossless webp stream signature
    if (chunkHeader === "VP8 " && input[0] !== 0x2f) {
      return calculateLossy(input);
    }

    // Lossy webp stream signature
    const signature = toHexString(input, 3, 6);
    if (chunkHeader === "VP8L" && signature !== "9d012a") {
      return calculateLossless(input);
    }
  },
};

const getResizedBitmap = (width, height, channelCount, bitmap) =>
  new Promise((resolve) => {
    const resize = new Resize(
      width,
      height,
      WIDTH_TO_RESIZE,
      HEIGHT_TO_RESIZE,
      channelCount === 4,
      false,
      resolve
    );
    resize.resize(bitmap);
  });

module.exports = {
  getDimensions,
  getResizedBitmap,
};
