const MIMES = {
  PNG: 0x89,
  JPG: 0xff,
  WEBP: 0x52,
};

const BYTE_COMPARERS = {
  [MIMES.PNG]: (byte1, byte2) => byte1 === byte2,
  [MIMES.JPG]: (byte1, byte2) => Math.abs(byte1 - byte2) < 30,
  [MIMES.WEBP]: (byte1, byte2) => Math.abs(byte1 - byte2) < 30,
};

// Used to detect "fried" png's: http://www.jongware.com/pngdefry.html
const pngFriedChunkName = "CgBI";

const HIT_THRESHOLD = 0.4;

const WIDTH_TO_RESIZE = 2;
const HEIGHT_TO_RESIZE = WIDTH_TO_RESIZE;

const EXIF_HEADER_BYTES = 6;
const EXIF_MARKER = "45786966";
const APP1_DATA_SIZE_BYTES = 2;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = "4d4d";
const LITTLE_ENDIAN_BYTE_ALIGN = "4949";

// Each entry is exactly 12 bytes
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;

module.exports = {
  MIMES,
  EXIF_MARKER,
  HIT_THRESHOLD,
  BYTE_COMPARERS,
  IDF_ENTRY_BYTES,
  WIDTH_TO_RESIZE,
  HEIGHT_TO_RESIZE,
  pngFriedChunkName,
  EXIF_HEADER_BYTES,
  APP1_DATA_SIZE_BYTES,
  TIFF_BYTE_ALIGN_BYTES,
  BIG_ENDIAN_BYTE_ALIGN,
  LITTLE_ENDIAN_BYTE_ALIGN,
  NUM_DIRECTORY_ENTRIES_BYTES,
};
