const assert = require("node:assert");
const { join } = require("node:path");
const { readFileSync } = require("node:fs");
const { describe, it } = require("node:test");

const { compare, MODES } = require("../index");

const commonImagesPath = ["test", "images"];

describe("png", () => {
  const commonPngImagesPath = [...commonImagesPath, "png"];

  it("should return false for different png images", async () => {
    const expected = false;
    const commonPathSegments = [...commonPngImagesPath, "different"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should return true for same png images", async () => {
    const expected = true;
    const commonPathSegments = [...commonPngImagesPath, "same"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should perceive different images as same with low threshold", async () => {
    const expected = true;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) < 256;
    const commonPathSegments = [...commonPngImagesPath, "different"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
    });

    assert.strictEqual(actual, expected);
  });

  it("should perceive same images as different with high threshold", async () => {
    const expected = false;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) > 255;
    const commonPathSegments = [...commonPngImagesPath, "same"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
    });

    assert.strictEqual(actual, expected);
  });

  it("should detect same images with grayscale with CHECK_GRAYSCALE flag", async () => {
    const expected = true;
    const commonPathSegments = [...commonPngImagesPath, "same-with-grayscale"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2, {
      modes: MODES.CHECK_GRAYSCALE,
    });

    assert.strictEqual(actual, expected);
  });

  it("should detect mogrified same images", async () => {
    const expected = true;
    const commonPathSegments = [...commonPngImagesPath, "mogrified"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should detect big resized same images", async () => {
    const expected = true;
    const commonPathSegments = [...commonPngImagesPath, "big-resized"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should detect same inversed images with CHECK_INVERSION flag", async () => {
    const expected = true;
    const commonPathSegments = [...commonPngImagesPath, "same-inversed"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2, {
      modes: MODES.CHECK_INVERSION,
    });

    assert.strictEqual(actual, expected);
  });

  it("should detect strictly same rotated images with CHECK_ROTATION flag", async () => {
    const expected = true;
    const commonPathSegments = [...commonPngImagesPath, "same-rotated"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));
    const image3 = readFileSync(join(...commonPathSegments, "image3.png"));
    const image4 = readFileSync(join(...commonPathSegments, "image4.png"));
    const strictCompareFunction = (byte1, byte2) => byte1 === byte2;

    const actual1 = await compare(image1, image2, {
      modes: MODES.CHECK_ROTATION,
      compareFunction: strictCompareFunction,
    });
    const actual2 = await compare(image2, image3, {
      modes: MODES.CHECK_ROTATION,
      compareFunction: strictCompareFunction,
    });
    const actual3 = await compare(image3, image4, {
      modes: MODES.CHECK_ROTATION,
      compareFunction: strictCompareFunction,
    });
    const actual4 = await compare(image4, image1, {
      modes: MODES.CHECK_ROTATION,
      compareFunction: strictCompareFunction,
    });

    assert.strictEqual(actual1, expected);
    assert.strictEqual(actual2, expected);
    assert.strictEqual(actual3, expected);
    assert.strictEqual(actual4, expected);
  });
});

describe("jpg", () => {
  const commonJpgImagesPath = [...commonImagesPath, "jpg"];

  it("should return false for different jpg images", async () => {
    const expected = false;
    const commonPathSegments = [...commonJpgImagesPath, "different"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.jpg"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.jpg"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should return true for same jpg images", async () => {
    const expected = true;
    const commonPathSegments = [...commonJpgImagesPath, "same"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.jpg"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.jpg"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should perceive different images as same with low threshold", async () => {
    const expected = true;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) < 256;
    const commonPathSegments = [...commonJpgImagesPath, "different"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.jpg"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.jpg"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
    });

    assert.strictEqual(actual, expected);
  });

  it("should perceive same images as different with high threshold", async () => {
    const expected = false;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) > 255;
    const commonPathSegments = [...commonJpgImagesPath, "same"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.jpg"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.jpg"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
    });

    assert.strictEqual(actual, expected);
  });

  it("should detect same images with changed hue", async () => {
    const expected = true;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) > 255;
    const commonPathSegments = [
      ...commonJpgImagesPath,
      "same-with-changed-hue",
    ];
    const image1 = readFileSync(join(...commonPathSegments, "image1.jpg"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.jpg"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
      modes: MODES.CHECK_HUE,
    });

    assert.strictEqual(actual, expected);
  });
});

describe("webp", () => {
  const commonWebpImagesPath = [...commonImagesPath, "webp"];

  it("should return false for different webp images", async () => {
    const expected = false;
    const commonPathSegments = [...commonWebpImagesPath, "different"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.webp"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.webp"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should return true for same webp images", async () => {
    const expected = true;
    const commonPathSegments = [...commonWebpImagesPath, "same"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.webp"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.webp"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should perceive different images as same with low threshold", async () => {
    const expected = true;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) < 256;
    const commonPathSegments = [...commonWebpImagesPath, "different"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.webp"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.webp"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
    });

    assert.strictEqual(actual, expected);
  });

  it("should perceive same images as different with high threshold", async () => {
    const expected = false;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) > 255;
    const commonPathSegments = [...commonWebpImagesPath, "same"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.webp"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.webp"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
    });

    assert.strictEqual(actual, expected);
  });
});

describe("mixins", () => {
  const commonPngImagesPath = [...commonImagesPath, "png"];
  const commonJpgImagesPath = [...commonImagesPath, "jpg"];

  it("should return false for different png and jpg images", async () => {
    const expected = false;
    const jpgImage = readFileSync(
      join(...commonJpgImagesPath, "different", "image1.jpg")
    );
    const pngImage = readFileSync(
      join(...commonPngImagesPath, "different", "image1.png")
    );

    const actual = await compare(jpgImage, pngImage);

    assert.strictEqual(actual, expected);
  });

  it("should return true for same png and jpg images", async () => {
    const expected = true;
    const jpgImage = readFileSync(
      join(...commonImagesPath, "mixins", "image.jpg")
    );
    const pngImage = readFileSync(
      join(...commonImagesPath, "mixins", "image.png")
    );

    const actual = await compare(jpgImage, pngImage);

    assert.strictEqual(actual, expected);
  });

  it("should not throw on interformat webp comparison", async () => {
    const expected = false;
    const webpImage = readFileSync(
      join(...commonImagesPath, "webp", "same", "image1.webp")
    );
    const pngImage = readFileSync(
      join(...commonImagesPath, "mixins", "image.png")
    );

    const actual = await compare(webpImage, pngImage);

    assert.strictEqual(actual, expected);
  });

  it("should detect same webp and png images as same", async () => {
    const expected = true;
    const webpImage = readFileSync(
      join(...commonImagesPath, "webp", "same", "image1.webp")
    );
    const pngImage = readFileSync(
      join(...commonImagesPath, "mixins", "image3.png")
    );

    const actual = await compare(webpImage, pngImage);

    assert.strictEqual(actual, expected);
  });

  it("should perceive same interformat images as different with high threshold", async () => {
    const expected = false;
    const comparator = (byte1, byte2) => Math.abs(byte1 - byte2) > 255;
    const commonPathSegments = [...commonImagesPath, "mixins"];
    const image1 = readFileSync(join(...commonPathSegments, "image.jpg"));
    const image2 = readFileSync(join(...commonPathSegments, "image.png"));

    const actual = await compare(image1, image2, {
      compareFunction: comparator,
    });

    assert.strictEqual(actual, expected);
  });
});
