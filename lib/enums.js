const MIMES = {
  PNG: 0x89,
  JPG: 0xff,
};

const BYTE_COMPARERS = {
  [MIMES.PNG]: (byte1, byte2) => byte1 === byte2,
  [MIMES.JPG]: (byte1, byte2) => Math.abs(byte1 - byte2) < 30,
};

// Used to detect "fried" png's: http://www.jongware.com/pngdefry.html
const pngFriedChunkName = "CgBI";

module.exports = {
  MIMES,
  BYTE_COMPARERS,
  pngFriedChunkName,
};
