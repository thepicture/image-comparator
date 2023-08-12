const assert = require("node:assert");
const { join } = require("node:path");
const { readFileSync } = require("node:fs");
const { describe, it } = require("node:test");

const { compare } = require("../index");

describe("png", () => {
  const commonImagesPath = ["test", "images", "png"];

  it("should return false for different png images", async () => {
    const expected = false;
    const commonPathSegments = [...commonImagesPath, "different"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });

  it("should return true for same png images", async () => {
    const expected = true;
    const commonPathSegments = [...commonImagesPath, "same"];
    const image1 = readFileSync(join(...commonPathSegments, "image1.png"));
    const image2 = readFileSync(join(...commonPathSegments, "image2.png"));

    const actual = await compare(image1, image2);

    assert.strictEqual(actual, expected);
  });
});
