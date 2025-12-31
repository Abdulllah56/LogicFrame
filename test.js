const assert = require('assert');
const fs = require('fs');

// Test case 1: Check if the API route has been updated
const apiRoute = fs.readFileSync('app/api/sam-segment/route.js', 'utf-8');
assert.ok(apiRoute.includes('cjwbw/semantic-segment-anything:5bd628343da6eef237cea655a5f13d35a32f84a530435364a1b4a56e00218911'), 'API route should use the correct model');
assert.ok(apiRoute.includes('point_coords: [[point.x, point.y]]'), 'API route should pass point_coords');

// Test case 2: Check if the decodeRle function has been added to the page.js
const pageJs = fs.readFileSync('app/Imageeditor/page.js', 'utf-8');
assert.ok(pageJs.includes('const decodeRle = (rle) => {'), 'decodeRle function should be added to page.js');

// Test case 3: Check if handleMagicGrabClick is using the decodeRle function
assert.ok(pageJs.includes('const decodedMask = decodeRle(result.mask);'), 'handleMagicGrabClick should use decodeRle');

console.log('All tests passed!');
