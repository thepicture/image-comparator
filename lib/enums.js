const MIMES = {
  PNG: 0x89,
};

// Used to detect "fried" png's: http://www.jongware.com/pngdefry.html
const pngFriedChunkName = "CgBI";

module.exports = {
  MIMES,
  pngFriedChunkName,
};
