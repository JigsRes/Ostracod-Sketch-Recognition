import { Point, getApproxXCoordinate } from './utils.js';

/**
 * Shape analysis functions for ostracod outline processing
 */

/**
 * Find centroid of a sketch outline
 * @param {Point[]} points - Array of all points in the outline
 * @returns {Point} Centroid point
 */
function findCentroid(points) {
  let sumX = 0;
  let sumY = 0;

  for (const point of points) {
    sumX += point.getX();
    sumY += point.getY();
  }

  const centroid = new Point(sumX / points.length, sumY / points.length);
  return centroid;
}

/**
 * Split outline into upper and lower halves based on max length endpoints
 * @param {Point[]} points - All points in the outline
 * @param {Point[]} maxPoints - The two endpoints of maximum length [left, right]
 * @param {Point} centroid - Center point of the outline
 * @returns {Object} {upper: [], lower: []} - Points split into halves
 */
function findHalves(points, maxPoints, centroid) {
  const upper = [];
  const lower = [];

  const leftMax = maxPoints[0];
  const rightMax = maxPoints[1];

  for (const point of points) {
    const y = point.getY();
    const x = point.getX();
    
    // Both below the max line
    if (y <= leftMax.getY() && y <= rightMax.getY()) {
      lower.push(point);
    }
    // Both above the max line
    else if (y >= leftMax.getY() && y >= rightMax.getY()) {
      upper.push(point);
    }
    // In between - split by centroid
    else {
      if (y >= leftMax.getY()) {
        if (x < centroid.getX()) {
          upper.push(point);
        } else {
          lower.push(point);
        }
      } else {
        if (x < centroid.getX()) {
          lower.push(point);
        } else {
          upper.push(point);
        }
      }
    }
  }

  return { upper, lower };
}

/**
 * Rotate sketch to align max length horizontally
 * @param {Point[]} points - All points in outline
 * @param {Point[]} maxPoints - Max length endpoints
 * @returns {Object} {rotatedPoints: [], rotatedMaxPoints: []}
 */
function rotateOutline(points, maxPoints) {
  const leftMax = maxPoints[0].getX() < maxPoints[1].getX() ? maxPoints[0] : maxPoints[1];
  const rightMax = maxPoints[0].getX() < maxPoints[1].getX() ? maxPoints[1] : maxPoints[0];

  const angleOfRotation = Math.atan(
    (leftMax.getY() - rightMax.getY()) / (leftMax.getX() - rightMax.getX())
  );

  const rotatedPoints = [];
  const cos = Math.cos(-angleOfRotation);
  const sin = Math.sin(-angleOfRotation);

  for (const point of points) {
    const newX = point.getX() * cos - point.getY() * sin;
    const newY = point.getY() * cos + point.getX() * sin;
    rotatedPoints.push(new Point(newX, newY, point.getTime(), point.getId()));
  }

  // Rotate max points
  const rotatedMax1X = maxPoints[0].getX() * cos - maxPoints[0].getY() * sin;
  const rotatedMax1Y = maxPoints[0].getY() * cos + maxPoints[0].getX() * sin;
  const rotatedMax2X = maxPoints[1].getX() * cos - maxPoints[1].getY() * sin;
  const rotatedMax2Y = maxPoints[1].getY() * cos + maxPoints[1].getX() * sin;

  return {
    rotatedPoints,
    rotatedMaxPoints: [
      new Point(rotatedMax1X, rotatedMax1Y),
      new Point(rotatedMax2X, rotatedMax2Y)
    ]
  };
}

/**
 * Find the point with maximum vertical distance from centroid
 * @param {Point[]} points - All points in outline
 * @param {Point} referencePoint - Centroid point
 * @param {Point[]} maxPoints - Max length endpoints
 * @returns {Object} {maxPoint, maxHeight, maxLengthRatio, maxHeightRatio}
 */
function findVerticalDistances(points, referencePoint, maxPoints) {
  let maxVerticalDistanceSquared = 0;
  let maxPoint = null;
  const upperPoints = [];
  const lowerPoints = [];

  // Divide points into upper and lower halves
  for (const point of points) {
    if (point.getY() < referencePoint.getY()) {
      upperPoints.push(point);
      const distSquared = point.distanceSquared(point.getX(), referencePoint.getY());
      if (distSquared > maxVerticalDistanceSquared) {
        maxVerticalDistanceSquared = distSquared;
        maxPoint = point;
      }
    } else {
      lowerPoints.push(point);
    }
  }

  if (!maxPoint) return null;

  const otherPoint = getApproxXCoordinate(lowerPoints, maxPoint.getX());
  const maxHeight = maxPoint.distance(otherPoint);

  const y1 = maxPoints[0].getY();
  const y2 = maxPoint.getY();
  const y3 = otherPoint ? otherPoint.getY() : y1;
  const maxLengthRatio = Math.abs((y1 - y2) / (y2 - y3 || 1));

  const x1 = maxPoints[0].getX();
  const x2 = maxPoints[1].getX();
  const x3 = maxPoint.getX();
  const maxHeightRatio = Math.abs((x3 - x1) / (x2 - x1 || 1));

  return {
    maxPoint,
    maxHeight,
    maxLengthRatio,
    maxHeightRatio,
    otherPoint
  };
}

/**
 * Find the maximum distance between any two points
 * @param {Point[]} points - Array of points
 * @returns {Object} {point1, point2, distance}
 */
function findMaxLength(points) {
  let maxDistance = 0;
  let maxPoint1 = null;
  let maxPoint2 = null;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const distance = points[i].distance(points[j]);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxPoint1 = points[i];
        maxPoint2 = points[j];
      }
    }
  }

  return {
    point1: maxPoint1,
    point2: maxPoint2,
    distance: maxDistance
  };
}

/**
 * Determine which side (left or right) is less curved
 * @param {Point[]} upperPoints - Upper half points
 * @param {Point[]} lowerPoints - Lower half points
 * @param {Point[]} maxPoints - Max length endpoints
 * @returns {string} "Left" or "Right"
 */
function getLessCurvedSide(upperPoints, lowerPoints, maxPoints) {
  const maxHorizontalDistance = maxPoints[0].distance(maxPoints[1]);
  
  const leftPointX = Math.min(maxPoints[0].getX(), maxPoints[1].getX());
  const rightPointX = Math.max(maxPoints[0].getX(), maxPoints[1].getX());
  const delta = maxHorizontalDistance * 0.05;

  const upperLeft = getApproxXCoordinate(upperPoints, leftPointX + delta);
  const upperRight = getApproxXCoordinate(upperPoints, rightPointX - delta);
  const lowerLeft = getApproxXCoordinate(lowerPoints, leftPointX + delta);
  const lowerRight = getApproxXCoordinate(lowerPoints, rightPointX - delta);

  const leftDistance = upperLeft.distance(lowerLeft);
  const rightDistance = upperRight.distance(lowerRight);

  return leftDistance > rightDistance ? "Left" : "Right";
}

/**
 * Determine valve side based on geometry
 * @param {Point} pointWithMaxHeight - Point with maximum vertical distance
 * @param {Point} centroid - Center point
 * @returns {string} "Left" or "Right"
 */
function determineValveSide(pointWithMaxHeight, centroid) {
  return pointWithMaxHeight.getX() > centroid.getX() ? "Right" : "Left";
}

export {
  findCentroid,
  findHalves,
  rotateOutline,
  findVerticalDistances,
  findMaxLength,
  getLessCurvedSide,
  determineValveSide
};
