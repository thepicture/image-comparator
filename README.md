# image-comparator

Compares images by resizing and checking color match without external dependencies.

Uses various image processing functions to resize and compare the images. The comparison is done by checking if the resized and processed versions of two images are equal.

Allows to detect image similarity even if they are resized.

# Install

```bash
npm install --save image-comparator
```

# Test

```bash
npm test
```

# Example

```js
const fs = require("node:fs");
const comparator = require("image-comparator");

async function main() {
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
}

main();
```

## Supported formats

- png

## Detection algorithm

1. Retrieve dimensions and bitmap data from the input image buffers
2. Resize the images to a consistent size
3. Compare the resized images using the `areBuffersEqual` function
