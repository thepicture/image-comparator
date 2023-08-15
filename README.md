# image-comparator

Compares images by resizing and checking color match without external dependencies

## Install

```bash
npm install --save image-comparator
```

## Test

```bash
npm test
```

## Example

```js
const fs = require("node:fs");
const comparator = require("image-comparator");

const imagePath1 = "path/to/image1.png";
const imagePath2 = "path/to/image2.png";

const imageBuffer1 = fs.readFileSync(imagePath1);
const imageBuffer2 = fs.readFileSync(imagePath2);

const compare = async () => {
  const areSame = await comparator.compare(imageBuffer1, imageBuffer2);

  if (areSame) {
    console.log("Images are the same");
  } else {
    console.log("Images are different");
  }
};

compare();
```

### With custom threshold

```js
const fs = require("node:fs");
const comparator = require("image-comparator");

const imagePath1 = "path/to/same.png";
const imagePath2 = "path/to/same.jpg";

const imageBuffer1 = fs.readFileSync(imagePath1);
const imageBuffer2 = fs.readFileSync(imagePath2);

const compare = async () => {
  const compareFunction = (byte1, byte2) => false; // Images are always different

  const areSame = await comparator.compare(
    imageBuffer1,
    imageBuffer2,
    compareFunction
  );

  if (areSame) {
    throw new Error("Should not happen");
  } else {
    console.log("Images are different");
  }
};

compare();
```

```js
const fs = require("node:fs");
const comparator = require("image-comparator");

const imagePath1 = "path/to/same.png";
const imagePath2 = "path/to/same.jpg";

const imageBuffer1 = fs.readFileSync(imagePath1);
const imageBuffer2 = fs.readFileSync(imagePath2);

const compare = async () => {
  const compareFunction = (byte1, byte2) => Math.abs(byte1 - byte2) < 128; // If color difference is small enough

  const areSame = await comparator.compare(
    imageBuffer1,
    imageBuffer2,
    compareFunction
  );

  if (areSame) {
    console.log("Images are the same");
  } else {
    console.log("Images are different");
  }
};

compare();
```

# API

```js
compare: (
  buffer1: Buffer,
  buffer2: Buffer,
  compareFunction: (byte1, byte2) => boolean
) => bool;
```

Compares two images.

Throws if WEBP image is compared with imag of another extension.

## Supported extensions

- png
- jpg
- webp

## Detection algorithm

1. Retrieve dimensions and bitmap data from the input image buffers
2. Resize the images to a consistent mini size
3. Compare the resized images using the `areBuffersEqual` function

## Notes

- May produce false positives for comparison of images of different format origins due to inconsistent resulting bitmap size (use `compareFunction` to avoid this)
- Can work with interformat images, but WEBP is not supported for this at the moment
