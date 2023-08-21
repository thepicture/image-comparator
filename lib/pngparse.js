// https://www.npmjs.com/package/pngparse

var stream = require("node:stream"),
  zlib = require("node:zlib"),
  HEADER = new Uint8ClampedArray([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

function ImageData(width, height, channels, data, trailer) {
  this.width = width;
  this.height = height;
  this.channels = channels;
  this.data = data;
  this.trailer = trailer;
}

function paeth(a, b, c) {
  var p = a + b - c,
    pa = Math.abs(p - a),
    pb = Math.abs(p - b),
    pc = Math.abs(p - c);

  if (pa <= pb && pa <= pc) return a;

  if (pb <= pc) return b;

  return c;
}

parseStream = function (stream, callback) {
  var inflate = zlib.createInflate(),
    state = 0,
    off = 0,
    buf = new Uint8Array(13),
    waiting = 2,
    b = -1,
    p = 0,
    pngPaletteEntries = 0,
    pngAlphaEntries = 0,
    chunkLength,
    pngWidth,
    pngHeight,
    pngBitDepth,
    pngDepthMult,
    pngColorType,
    pngPixels,
    pngSamplesPerPixel,
    pngBytesPerPixel,
    pngBytesPerScanline,
    pngSamples,
    currentScanline,
    priorScanline,
    scanlineFilter,
    pngTrailer,
    pngPalette,
    pngAlpha,
    idChannels;

  function end() {
    if (!--waiting)
      return callback(
        undefined,
        new ImageData(pngWidth, pngHeight, idChannels, pngPixels, pngTrailer)
      );
  }

  stream.on("end", function () {
    stream.destroy();

    return end();
  });

  inflate.on("end", function () {
    if (inflate.destroy) inflate.destroy();

    return end();
  });

  stream.on("data", function (data) {
    /* If an error occurred, bail. */
    if (!stream.readable) return;

    var len = data.length,
      i = 0,
      tmp,
      j;

    while (i !== len)
      switch (state) {
        case 0 /* PNG header */:
          if (data[i++] !== HEADER[off++]) return;

          if (off === HEADER.length) {
            state = 1;
            off = 0;
          }
          break;

        case 1 /* PNG chunk length and type */:
          if (len - i < 8 - off) {
            data.copy(buf, off, i);
            off += len - i;
            i = len;
          } else {
            data.copy(buf, off, i, i + 8 - off);

            i += 8 - off;
            off = 0;
            chunkLength = new DataView(buf.buffer).getUint32(0);

            const decoder = new TextDecoder();

            switch (decoder.decode(buf.slice(4, 8))) {
              case "IHDR":
                state = 2;
                break;

              case "PLTE":
                /* The PNG spec states that PLTE is only required for type 3.
                 * It may appear in other types, but is only useful if the
                 * display does not support true color. Since we're just a data
                 * storage format, we don't have to worry about it. */
                if (pngColorType !== 3) state = 7;
                else {
                  pngPaletteEntries = chunkLength / 3;
                  pngPalette = new Uint8Array(chunkLength);
                  state = 3;
                }
                break;

              case "tRNS":
                /* We only support tRNS on paletted images right now. Those
                 * images may either have 1 or 3 channels, but in either case
                 * we add one for transparency. */
                idChannels++;

                pngAlphaEntries = chunkLength;
                pngAlpha = new Uint8Array(chunkLength);
                state = 4;
                break;

              case "IDAT":
                /* Allocate the PNG if we havn't yet. (We wait to do it until
                 * here since tRNS may change idChannels, so we can't be sure of
                 * the size needed until we hit IDAT. With all that, might as
                 * well wait until we're actually going to start filling the
                 * buffer in case of errors...) */
                if (!pngPixels)
                  pngPixels = new Uint8Array(pngWidth * pngHeight * idChannels);

                state = 5;
                break;

              case "IEND":
                state = 6;
                break;

              default:
                state = 7;
                break;
            }
          }
          break;

        case 2 /* IHDR */:
          if (len - i < chunkLength - off) {
            data.copy(buf, off, i);
            off += len - i;
            i = len;
          } else {
            data.copy(buf, off, i, i + chunkLength - off);

            i += chunkLength - off;
            state = 8;
            off = 0;
            pngWidth = new DataView(buf.buffer).getUint32(0);
            pngHeight = new DataView(buf.buffer).getUint32(4);
            pngBitDepth = new DataView(buf.buffer).getUint8(8, true);
            pngDepthMult = 255 / ((1 << pngBitDepth) - 1);
            pngColorType = new DataView(buf.buffer).getUint8(9, true);

            switch (pngColorType) {
              case 0:
                pngSamplesPerPixel = 1;
                pngBytesPerPixel = Math.ceil(pngBitDepth * 0.125);
                idChannels = 1;
                break;

              case 2:
                pngSamplesPerPixel = 3;
                pngBytesPerPixel = Math.ceil(pngBitDepth * 0.375);
                idChannels = 3;
                break;

              case 3:
                pngSamplesPerPixel = 1;
                pngBytesPerPixel = 1;
                idChannels = 3;
                break;

              case 4:
                pngSamplesPerPixel = 2;
                pngBytesPerPixel = Math.ceil(pngBitDepth * 0.25);
                idChannels = 2;
                break;

              case 6:
                pngSamplesPerPixel = 4;
                pngBytesPerPixel = Math.ceil(pngBitDepth * 0.5);
                idChannels = 4;
                break;

              default:
                return;
            }

            pngBytesPerScanline = Math.ceil(
              (pngWidth * pngBitDepth * pngSamplesPerPixel) / 8
            );
            pngSamples = new Uint8ClampedArray(pngSamplesPerPixel);
            currentScanline = new Uint8ClampedArray(pngBytesPerScanline);
            priorScanline = new Uint8ClampedArray(pngBytesPerScanline);
            currentScanline.fill(0);
          }
          break;

        case 3 /* PLTE */:
          if (len - i < chunkLength - off) {
            data.copy(pngPalette, off, i);
            off += len - i;
            i = len;
          } else {
            data.copy(pngPalette, off, i, i + chunkLength - off);
            i += chunkLength - off;
            state = 8;
            off = 0;

            /* If each entry in the color palette is grayscale, set the channel
             * count to 1. */
            idChannels = 1;
            for (j = pngPaletteEntries; j--; )
              if (
                pngPalette[j * 3 + 0] !== pngPalette[j * 3 + 1] ||
                pngPalette[j * 3 + 0] !== pngPalette[j * 3 + 2]
              ) {
                idChannels = 3;
                break;
              }
          }
          break;

        case 4 /* tRNS */:
          if (len - i < chunkLength - off) {
            data.copy(pngAlpha, off, i);
            off += len - i;
            i = len;
          } else {
            data.copy(pngAlpha, off, i, i + chunkLength - off);
            i += chunkLength - off;
            state = 8;
            off = 0;
          }
          break;

        case 5 /* IDAT */:
          /* If the amount available is less than the amount remaining, then
           * feed as much as we can to the inflator. */
          if (len - i < chunkLength - off) {
            /* FIXME: Do I need to be smart and check the return value? */
            inflate.write(data.slice(i));
            off += len - i;
            i = len;
          } else {
            /* Otherwise, write the last bit of the data to the inflator, and
             * finish processing the chunk. */
            /* FIXME: Do I need to be smart and check the return value? */
            inflate.write(data.slice(i, i + chunkLength - off));
            i += chunkLength - off;
            state = 8;
            off = 0;
          }
          break;

        case 6 /* IEND */:
          if (len - i < 4 - off) {
            off += len - i;
            i = len;
          } else {
            pngTrailer = new Uint8ClampedArray(0);
            i += 4 - off;
            state = 9;
            off = 0;

            inflate.end();
          }
          break;

        case 7 /* unrecognized chunk */:
          if (len - i < chunkLength - off) {
            off += len - i;
            i = len;
          } else {
            i += chunkLength - off;
            state = 8;
            off = 0;
          }
          break;

        case 8 /* chunk crc */:
          /* FIXME: CRC is blatantly ignored */
          if (len - i < 4 - off) {
            off += len - i;
            i = len;
          } else {
            i += 4 - off;
            state = 1;
            off = 0;
          }
          break;

        case 9 /* trailing data */:
          /* FIXME: It is inefficient to create a trailer buffer of length zero
           * and keep reallocating it every time we want to add more data. */
          tmp = new Uint8ClampedArray(off + len - i);
          pngTrailer.copy(tmp);
          data.copy(tmp, off, i, len);
          pngTrailer = tmp;
          off += len - i;
          i = len;
          break;
      }
  });

  inflate.on("data", function (data) {
    /* If an error occurred, bail. */
    if (!inflate.readable) return;

    var len = data.length,
      i,
      tmp,
      x,
      j,
      k;

    for (i = 0; i !== len; ++i) {
      if (b === -1) {
        scanlineFilter = data[i];
        tmp = currentScanline;
        currentScanline = priorScanline;
        priorScanline = tmp;
      } else
        switch (scanlineFilter) {
          case 0:
            currentScanline[b] = data[i];
            break;

          case 1:
            currentScanline[b] =
              b < pngBytesPerPixel
                ? data[i]
                : (data[i] + currentScanline[b - pngBytesPerPixel]) & 255;
            break;

          case 2:
            currentScanline[b] = (data[i] + priorScanline[b]) & 255;
            break;

          case 3:
            currentScanline[b] =
              (data[i] +
                ((b < pngBytesPerPixel
                  ? priorScanline[b]
                  : currentScanline[b - pngBytesPerPixel] +
                    priorScanline[b]) >>>
                  1)) &
              255;
            break;

          case 4:
            currentScanline[b] =
              (data[i] +
                (b < pngBytesPerPixel
                  ? priorScanline[b]
                  : paeth(
                      currentScanline[b - pngBytesPerPixel],
                      priorScanline[b],
                      priorScanline[b - pngBytesPerPixel]
                    ))) &
              255;
            break;

          default:
            return;
        }

      if (++b === pngBytesPerScanline) {
        /* We have now read a complete scanline, so unfilter it and write it
         * into the pixel array. */
        for (j = 0, x = 0; x !== pngWidth; ++x) {
          /* Read all of the samples into the sample buffer. */
          for (k = 0; k !== pngSamplesPerPixel; ++j, ++k)
            switch (pngBitDepth) {
              case 1:
                pngSamples[k] = (currentScanline[j >>> 3] >> (7 - (j & 7))) & 1;
                break;

              case 2:
                pngSamples[k] =
                  (currentScanline[j >>> 2] >> ((3 - (j & 3)) << 1)) & 3;
                break;

              case 4:
                pngSamples[k] =
                  (currentScanline[j >>> 1] >> ((1 - (j & 1)) << 2)) & 15;
                break;

              case 8:
                pngSamples[k] = currentScanline[j];
                break;

              default:
                return;
            }

          /* Write the pixel based off of the samples so collected. */
          switch (pngColorType) {
            case 0:
              pngPixels[p++] = pngSamples[0] * pngDepthMult;
              break;

            case 2:
              pngPixels[p++] = pngSamples[0] * pngDepthMult;
              pngPixels[p++] = pngSamples[1] * pngDepthMult;
              pngPixels[p++] = pngSamples[2] * pngDepthMult;
              break;

            case 3:
              switch (idChannels) {
                case 1:
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3];
                  break;

                case 2:
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3];
                  pngPixels[p++] =
                    pngSamples[0] < pngAlphaEntries
                      ? pngAlpha[pngSamples[0]]
                      : 255;
                  break;

                case 3:
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 0];
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 1];
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 2];
                  break;

                case 4:
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 0];
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 1];
                  pngPixels[p++] = pngPalette[pngSamples[0] * 3 + 2];
                  pngPixels[p++] =
                    pngSamples[0] < pngAlphaEntries
                      ? pngAlpha[pngSamples[0]]
                      : 255;
                  break;
              }
              break;

            case 4:
              pngPixels[p++] = pngSamples[0] * pngDepthMult;
              pngPixels[p++] = pngSamples[1] * pngDepthMult;
              break;

            case 6:
              pngPixels[p++] = pngSamples[0] * pngDepthMult;
              pngPixels[p++] = pngSamples[1] * pngDepthMult;
              pngPixels[p++] = pngSamples[2] * pngDepthMult;
              pngPixels[p++] = pngSamples[3] * pngDepthMult;
              break;
          }
        }

        b = -1;
      }
    }
  });
};

parseBuffer = function (buf, callback) {
  /* Create a mock stream. */
  var s = new stream.Stream();

  /* Set up the destroy functionality. */
  s.readable = true;
  s.destroy = function () {
    s.readable = false;
  };

  /* Set up the PNG parsing hooks. */
  parseStream(s, callback);

  /* Send the data down the stream. */
  s.emit("data", buf);

  /* If no errors occurred in the data, close the stream. */
  if (s.readable) s.emit("end");
};

/* FIXME: This is deprecated. Remove it in 2.0. */
exports.parse = parseBuffer;
