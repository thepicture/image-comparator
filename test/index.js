const assert = require("node:assert");
const { join } = require("node:path");
const { readFileSync } = require("node:fs");
const { describe, it } = require("node:test");

const { compare } = require("../index");

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
});
