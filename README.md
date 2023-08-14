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

const areSame = await comparator.compare(imageBuffer1, imageBuffer2);

if (areSame) {
  console.log("Images are the same");
} else {
  console.log("Images are different");
}
```

## Supported formats

- png
- jpg
- webp

## Detection algorithm

1. Retrieve dimensions and bitmap data from the input image buffers
2. Resize the images to a consistent mini size
3. Compare the resized images using the `areBuffersEqual` function

## Notes

- May produce false positives for comparison of images of different format origins due to inconsistent resulting bitmap size
- Can work with interformat images, but WEBP is not supported for this at the moment
