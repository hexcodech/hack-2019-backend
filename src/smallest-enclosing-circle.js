/*
 * Smallest enclosing circle - Library (JavaScript)
 *
 * Copyright (c) 2018 Project Nayuki
 * https://www.nayuki.io/page/smallest-enclosing-circle
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program (see COPYING.txt and COPYING.LESSER.txt).
 * If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

/*
 * Returns the smallest circle that encloses all the given points. Runs in expected O(n) time, randomized.
 * Input: A list of points, where each point is an object {lng: float, lat: float}, e.g. [{lng:0,lat:5}, {lng:3.1,lat:-2.7}].
 * Output: A circle object of the form {lng: float, lat: float, r: float}.
 * Note: If 0 points are given, null is returned. If 1 point is given, a circle of radius 0 is returned.
 */
// Initially: No boundary points known
function makeCircle(points) {
  // Clone list to preserve the caller's data, do Durstenfeld shuffle
  var shuffled = points.slice();
  for (var i = points.length - 1; i >= 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    j = Math.max(Math.min(j, i), 0);
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Progressively add points to circle or recompute circle
  var c = null;
  shuffled.forEach(function(p, i) {
    if (c === null || !isInCircle(c, p))
      c = makeCircleOnePoint(shuffled.slice(0, i + 1), p);
  });
  return c;
}

module.exports.makeCircle = makeCircle;

// One boundary point known
function makeCircleOnePoint(points, p) {
  var c = { lng: p.lng, lat: p.lat, r: 0 };
  points.forEach(function(q, i) {
    if (!isInCircle(c, q)) {
      if (c.r == 0) c = makeDiameter(p, q);
      else c = makeCircleTwoPoints(points.slice(0, i + 1), p, q);
    }
  });
  return c;
}

// Two boundary points known
function makeCircleTwoPoints(points, p, q) {
  var circ = makeDiameter(p, q);
  var left = null;
  var right = null;

  // For each point not in the two-point circle
  points.forEach(function(r) {
    if (isInCircle(circ, r)) return;

    // Form a circumcircle and classify it on left or right side
    var cross = crossProduct(p.lng, p.lat, q.lng, q.lat, r.lng, r.lat);
    var c = makeCircumcircle(p, q, r);
    if (c === null) return;
    else if (
      cross > 0 &&
      (left === null ||
        crossProduct(p.lng, p.lat, q.lng, q.lat, c.lng, c.lat) >
          crossProduct(p.lng, p.lat, q.lng, q.lat, left.lng, left.lat))
    )
      left = c;
    else if (
      cross < 0 &&
      (right === null ||
        crossProduct(p.lng, p.lat, q.lng, q.lat, c.lng, c.lat) <
          crossProduct(p.lng, p.lat, q.lng, q.lat, right.lng, right.lat))
    )
      right = c;
  });

  // Select which circle to return
  if (left === null && right === null) return circ;
  else if (left === null && right !== null) return right;
  else if (left !== null && right === null) return left;
  else if (left !== null && right !== null)
    return left.r <= right.r ? left : right;
  else throw "Assertion error";
}

function makeDiameter(a, b) {
  var cx = (a.lng + b.lng) / 2;
  var cy = (a.lat + b.lat) / 2;
  var r0 = distance(cx, cy, a.lng, a.lat);
  var r1 = distance(cx, cy, b.lng, b.lat);
  return { lng: cx, lat: cy, r: Math.max(r0, r1) };
}

function makeCircumcircle(a, b, c) {
  // Mathematical algorithm from Wikipedia: Circumscribed circle
  var ox = (Math.min(a.lng, b.lng, c.lng) + Math.max(a.lng, b.lng, c.lng)) / 2;
  var oy = (Math.min(a.lat, b.lat, c.lat) + Math.max(a.lat, b.lat, c.lat)) / 2;
  var ax = a.lng - ox,
    ay = a.lat - oy;
  var bx = b.lng - ox,
    by = b.lat - oy;
  var cx = c.lng - ox,
    cy = c.lat - oy;
  var d = (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) * 2;
  if (d == 0) return null;
  var x =
    ox +
    ((ax * ax + ay * ay) * (by - cy) +
      (bx * bx + by * by) * (cy - ay) +
      (cx * cx + cy * cy) * (ay - by)) /
      d;
  var y =
    oy +
    ((ax * ax + ay * ay) * (cx - bx) +
      (bx * bx + by * by) * (ax - cx) +
      (cx * cx + cy * cy) * (bx - ax)) /
      d;
  var ra = distance(x, y, a.lng, a.lat);
  var rb = distance(x, y, b.lng, b.lat);
  var rc = distance(x, y, c.lng, c.lat);
  return { lng: x, lat: y, r: Math.max(ra, rb, rc) };
}

/* Simple mathematical functions */

var MULTIPLICATIVE_EPSILON = 1 + 1e-14;

function isInCircle(c, p) {
  return (
    c !== null &&
    distance(p.lng, p.lat, c.lng, c.lat) <= c.r * MULTIPLICATIVE_EPSILON
  );
}

// Returns twice the signed area of the triangle defined by (x0, y0), (x1, y1), (x2, y2).
function crossProduct(x0, y0, x1, y1, x2, y2) {
  return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
}

function distance(x0, y0, x1, y1) {
  return Math.hypot(x0 - x1, y0 - y1);
}

if (!("hypot" in Math)) {
  // Polyfill
  Math.hypot = function(x, y) {
    return Math.sqrt(x * x + y * y);
  };
}
