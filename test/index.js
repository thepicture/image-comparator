const assert = require('node:assert')
const {describe} = require('node:test')

const {compare} = require('../index')

describe('can call compare', () => {
    const expected = false;
    const image1 = new ArrayBuffer(4);
    const image2 = new ArrayBuffer(4);

    const actual = compare(image1, image2);

    assert.strictEqual(actual, expected);
})