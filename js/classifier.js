/**
 * Machine learning classifier for ostracod species recognition
 */

// Species names
const SPECIES = {
  EC: "Elofsonella Concinna",
  BE: "Baffinicythere Emarginata",
  CN: "Cytheropteron Nodosoalatum",
  L: "Leptocythere"
};

/**
 * Logistic regression coefficients trained on ostracod data
 * These coefficients weight the importance of each feature
 */
const COEFFICIENTS = {
  EC: {
    intercept: -36.373285,
    sharpness: 0.16206998,
    ratio: 46.042491,
    maxLengthRatio: -12.83812,
    topLengthRatio: 4.724668,
    botLengthRatio: -60.99577,
    topBotRatio: 20.94821
  },
  L: {
    intercept: 2.473576,
    sharpness: -0.08435574,
    ratio: 70.054086,
    maxLengthRatio: -27.68299,
    topLengthRatio: -45.096235,
    botLengthRatio: 21.57071,
    topBotRatio: -47.91339
  },
  CN: {
    intercept: 43.920487,
    sharpness: -0.0542765,
    ratio: -1.571042,
    maxLengthRatio: -59.08888,
    topLengthRatio: -37.920384,
    botLengthRatio: 94.12266,
    topBotRatio: -53.87436
  }
};

/**
 * Calculate probability score for a single species using logistic regression
 * @param {number} sharpness - Feature: sum of squared angles
 * @param {number} ratio - Feature: width/height ratio
 * @param {number} maxLengthRatio - Feature: proportion along max length
 * @param {number} topLengthRatio - Feature: top arc length / max length
 * @param {number} botLengthRatio - Feature: bottom arc length / max length
 * @param {number} topBotRatio - Feature: top arc / bottom arc ratio
 * @param {Object} coeffs - Coefficient object for the species
 * @returns {number} Probability score
 */
function calculateScore(sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio, coeffs) {
  const logOdds = coeffs.intercept +
    coeffs.sharpness * sharpness +
    coeffs.ratio * ratio +
    coeffs.maxLengthRatio * maxLengthRatio +
    coeffs.topLengthRatio * topLengthRatio +
    coeffs.botLengthRatio * botLengthRatio +
    coeffs.topBotRatio * topBotRatio;

  return Math.exp(logOdds);
}

/**
 * Predict ostracod species from features using trained logistic regression model
 * @param {number} sharpness - Feature: sum of squared angles
 * @param {number} ratio - Feature: width/height ratio
 * @param {number} maxLengthRatio - Feature: proportion along max length
 * @param {number} topLengthRatio - Feature: top arc length / max length
 * @param {number} botLengthRatio - Feature: bottom arc length / max length
 * @param {number} topBotRatio - Feature: top arc / bottom arc ratio
 * @returns {Object} {species, confidence, probabilities}
 */
function predict(sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio) {
  // Calculate raw scores
  const probEC = calculateScore(sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio, COEFFICIENTS.EC);
  const probL = calculateScore(sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio, COEFFICIENTS.L);
  const probCN = calculateScore(sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio, COEFFICIENTS.CN);

  // Normalize to probabilities using softmax
  const EC = probEC / (probL + probCN + 1);
  const L = probL / (probEC + probCN + 1);
  const CN = probCN / (probEC + probL + 1);
  const BE = 1 - EC - L - CN;

  // Find species with highest probability
  const probabilities = {
    EC: Math.max(0, Math.min(1, EC)),
    BE: Math.max(0, Math.min(1, BE)),
    CN: Math.max(0, Math.min(1, CN)),
    L: Math.max(0, Math.min(1, L))
  };

  let maxProb = Math.max(EC, BE, CN, L);
  let predictedSpecies = null;

  if (maxProb === EC) {
    predictedSpecies = SPECIES.EC;
  } else if (maxProb === BE) {
    predictedSpecies = SPECIES.BE;
  } else if (maxProb === CN) {
    predictedSpecies = SPECIES.CN;
  } else {
    predictedSpecies = SPECIES.L;
  }

  return {
    species: predictedSpecies,
    confidence: maxProb,
    probabilities
  };
}

/**
 * Validate feature values are within reasonable ranges
 * @param {Object} features - Feature object
 * @returns {boolean} True if valid
 */
function validateFeatures(features) {
  const { sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio } = features;
  
  return (
    typeof sharpness === 'number' && isFinite(sharpness) &&
    typeof ratio === 'number' && isFinite(ratio) && ratio > 0 &&
    typeof maxLengthRatio === 'number' && isFinite(maxLengthRatio) &&
    typeof topLengthRatio === 'number' && isFinite(topLengthRatio) &&
    typeof botLengthRatio === 'number' && isFinite(botLengthRatio) &&
    typeof topBotRatio === 'number' && isFinite(topBotRatio) && topBotRatio > 0
  );
}

export {
  SPECIES,
  COEFFICIENTS,
  predict,
  calculateScore,
  validateFeatures
};
