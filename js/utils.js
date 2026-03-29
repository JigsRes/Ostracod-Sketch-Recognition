/**
 * Utility functions for mathematical operations and point calculations
 */

// Point class from srlib (simplified for testing)
class Point {
  constructor(x, y, time = null, id = null) {
    this.x = x;
    this.y = y;
    this.time = time || Date.now();
    this.id = id || this.generateId();
  }

  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (t) {
      const e = 16 * Math.random() | 0;
      const i = 'x' === t ? e : (3 & e | 8);
      return i.toString(16);
    });
  }

  getX() { return this.x; }
  getY() { return this.y; }
  setX(x) { this.x = x; }
  setY(y) { this.y = y; }
  getId() { return this.id; }
  getTime() { return this.time; }

  /**
   * Calculate Euclidean distance to another point
   * @param {Point|number} p - Either a Point object or x-coordinate
   * @param {number} [yCoord] - y-coordinate if first parameter is x
   * @returns {number} Distance
   */
  distance(p, yCoord = null) {
    let targetX, targetY;
    
    if (p instanceof Point) {
      targetX = p.x;
      targetY = p.y;
    } else {
      targetX = p;
      targetY = yCoord;
    }

    const dx = this.x - targetX;
    const dy = this.y - targetY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance (more efficient when comparing distances)
   * @param {Point|number} p - Either a Point object or x-coordinate
   * @param {number} [yCoord] - y-coordinate if first parameter is x
   * @returns {number} Squared distance
   */
  distanceSquared(p, yCoord = null) {
    let targetX, targetY;
    
    if (p instanceof Point) {
      targetX = p.x;
      targetY = p.y;
    } else {
      targetX = p;
      targetY = yCoord;
    }

    return (this.x - targetX) * (this.x - targetX) + (this.y - targetY) * (this.y - targetY);
  }
}

/**
 * Calculate absolute difference between consecutive points
 * @param {Point[]} points - Array of Point objects
 * @returns {Object} {deltaX: [], deltaY: []} - Change in x and y coordinates
 */
function initializeDelta(points) {
  const deltaX = [];
  const deltaY = [];

  for (let i = 0; i < points.length - 1; i++) {
    const dX = points[i + 1].getX() - points[i].getX();
    const dY = points[i + 1].getY() - points[i].getY();
    deltaX.push(dX);
    deltaY.push(dY);
  }

  return { deltaX, deltaY };
}

/**
 * Calculate angles (theta) between consecutive vectors
 * @param {number[]} deltaX - X differences
 * @param {number[]} deltaY - Y differences
 * @returns {number[]} Array of rotation angles
 */
function initializeTheta(deltaX, deltaY) {
  const theta = [];

  for (let i = 1; i < deltaX.length; i++) {
    const dotProduct = deltaX[i] * deltaX[i - 1] + deltaY[i] * deltaY[i - 1];
    
    if (dotProduct !== 0) {
      const crossProduct = deltaX[i] * deltaY[i - 1] - deltaX[i - 1] * deltaY[i];
      const rotation = Math.atan(crossProduct / dotProduct);
      theta.push(rotation);
    }
  }

  return theta;
}

/**
 * Remove duplicate consecutive points
 * @param {Point[]} points - Array of Point objects
 * @returns {Point[]} Array with duplicates removed
 */
function removeDuplicatePoints(points) {
  const result = [...points];
  
  for (let i = 1; i < result.length; i++) {
    if (result[i].getX() === result[i - 1].getX() && 
        result[i].getY() === result[i - 1].getY()) {
      result.splice(i, 1);
      i--;
    }
  }

  return result;
}

/**
 * Resample points with uniform spacing
 * @param {Point[]} points - Array of Point objects
 * @param {Point[]} pointsCopy - Copy of points array
 * @param {number} S - Spacing distance
 * @returns {Object} {resampled: [], origIndex: []}
 */
function resamplePoints(points, pointsCopy, S) {
  let D = 0;
  const resampled = [points[0]];
  const origIndex = [0];

  for (let i = 1; i < points.length; i++) {
    const d = points[i - 1].distance(points[i]);
    
    if (D + d >= S) {
      const x = points[i - 1].getX() + ((S - D) / d) * (points[i].getX() - points[i - 1].getX());
      const y = points[i - 1].getY() + ((S - D) / d) * (points[i].getY() - points[i - 1].getY());
      const q = new Point(x, y, points[i].getTime());
      resampled.push(q);
      D = 0;
      points.splice(i, 0, q);
      origIndex.push(i);
    } else {
      D = D + d;
    }
  }

  return { resampled, origIndex };
}

/**
 * Calculate spacing for resampling based on diagonal
 * @param {Point[]} points - Array of Point objects
 * @returns {number} Recommended spacing
 */
function resampleSpacing(points) {
  let topLeftX = points[0].getX();
  let topLeftY = points[0].getY();
  let botRightX = points[0].getX();
  let botRightY = points[0].getY();

  for (let i = 0; i < points.length; i++) {
    if (points[i].getX() <= topLeftX) topLeftX = points[i].getX();
    if (points[i].getY() <= topLeftY) topLeftY = points[i].getY();
    if (points[i].getX() >= botRightX) botRightX = points[i].getX();
    if (points[i].getY() >= botRightY) botRightY = points[i].getY();
  }

  const diagonal = Math.sqrt(
    Math.pow(topLeftX - botRightX, 2) + Math.pow(topLeftY - botRightY, 2)
  );

  return diagonal / 40;
}

/**
 * Get approximate point at a specific x-coordinate
 * @param {Point[]} points - Array of Point objects
 * @param {number} x - X-coordinate to find
 * @returns {Point} Closest point to x-coordinate
 */
function getApproxXCoordinate(points, x) {
  let minDelta = Number.MAX_VALUE;
  let minPoint = null;

  for (const point of points) {
    const currDelta = Math.abs(point.getX() - x);
    if (currDelta < minDelta) {
      minDelta = currDelta;
      minPoint = point;
    }
  }

  return minPoint;
}

export {
  Point,
  initializeDelta,
  initializeTheta,
  removeDuplicatePoints,
  resamplePoints,
  resampleSpacing,
  getApproxXCoordinate
};
