import { initializeDelta, initializeTheta, removeDuplicatePoints } from './utils.js';

/**
 * Feature extraction for ostracod classification
 */

/**
 * Calculate morphological features from sketch outline
 * @param {Point[]} points - All points in the outline
 * @returns {Object} Features: rotation, smoothness, sharpness
 */
function extractMorphologicalFeatures(points) {
  // Remove duplicate consecutive points
  const cleanPoints = removeDuplicatePoints(points);

  if (cleanPoints.length < 3) {
    return { rotation: 0, smoothness: 0, sharpness: 0 };
  }

  // Calculate deltas and thetas
  const { deltaX, deltaY } = initializeDelta(cleanPoints);
  const theta = initializeTheta(deltaX, deltaY);

  let rotation = 0;
  let smoothness = 0;
  let sharpness = 0;

  for (const angle of theta) {
    rotation += angle;
    smoothness += Math.abs(angle);
    sharpness += Math.pow(angle, 2);
  }

  return {
    rotation,
    smoothness,
    sharpness
  };
}

/**
 * Calculate aspect ratio features
 * @param {number} maxLength - Distance between max points
 * @param {number} maxHeight - Maximum perpendicular distance
 * @param {number} topLength - Length of top arc
 * @param {number} botLength - Length of bottom arc
 * @returns {Object} Multiple ratio features
 */
function extractRatioFeatures(maxLength, maxHeight, topLength, botLength) {
  const ratio = maxLength / (maxHeight || 1);
  const topLengthRatio = topLength / (maxLength || 1);
  const botLengthRatio = botLength / (maxLength || 1);
  const topBotRatio = topLength / (botLength || 1);

  return {
    ratio,
    topLengthRatio,
    botLengthRatio,
    topBotRatio
  };
}

/**
 * Calculate stroke length for top and bottom halves
 * @param {Point[]} rotatedPoints - Rotated outline points
 * @param {Point[]} maxPoints - Rotated max length endpoints
 * @returns {Object} {totalLength, topLength, bottomLength}
 */
function calculateStrokeLengths(rotatedPoints, maxPoints) {
  let totalLength = 0;
  let topLength = 0;
  let bottomLength = 0;

  const maxY = Math.max(maxPoints[0].getY(), maxPoints[1].getY());

  for (let i = 0; i < rotatedPoints.length - 1; i++) {
    const dist = rotatedPoints[i].distance(rotatedPoints[i + 1]);
    totalLength += dist;

    if (rotatedPoints[i].getY() < maxY) {
      topLength += dist;
    } else {
      bottomLength += dist;
    }
  }

  return {
    totalLength,
    topLength,
    bottomLength
  };
}

/**
 * Extract all features needed for classification
 * @param {Point[]} points - All outline points
 * @param {Point[]} maxPoints - Max length endpoints
 * @param {Object} verticalData - Data from findVerticalDistances
 * @returns {Object} Complete feature set
 */
function extractAllFeatures(points, maxPoints, verticalData) {
  // Morphological features
  const morpho = extractMorphologicalFeatures(points);

  // Geometry features
  const maxLength = maxPoints[0].distance(maxPoints[1]);
  const maxHeight = verticalData.maxHeight;
  const maxLengthRatio = verticalData.maxLengthRatio;
  const maxHeightRatio = verticalData.maxHeightRatio;

  return {
    rotation: morpho.rotation,
    smoothness: morpho.smoothness,
    sharpness: morpho.sharpness,
    maxLength,
    maxHeight,
    maxLengthRatio,
    maxHeightRatio
  };
}

export {
  extractMorphologicalFeatures,
  extractRatioFeatures,
  calculateStrokeLengths,
  extractAllFeatures
};
