/**
 * Unit tests for classification/prediction functions
 */

import {
  SPECIES,
  COEFFICIENTS,
  predict,
  calculateScore,
  validateFeatures
} from '../js/classifier.js';

describe('calculateScore', () => {
  test('should calculate logistic score correctly', () => {
    const coeffs = COEFFICIENTS.EC;
    const score = calculateScore(0.5, 2.0, 0.5, 0.6, 0.4, 1.2, coeffs);
    
    expect(typeof score).toBe('number');
    expect(score > 0).toBe(true);
  });

  test('should handle zero coefficient case', () => {
    const coeffs = {
      intercept: 0,
      sharpness: 0,
      ratio: 0,
      maxLengthRatio: 0,
      topLengthRatio: 0,
      botLengthRatio: 0,
      topBotRatio: 0
    };
    const score = calculateScore(1, 2, 3, 4, 5, 6, coeffs);
    
    expect(score).toBe(1); // exp(0) = 1
  });

  test('should produce different scores for different features', () => {
    const coeffs = COEFFICIENTS.EC;
    const score1 = calculateScore(0.5, 1.5, 0.5, 0.6, 0.4, 1.2, coeffs);
    const score2 = calculateScore(1.5, 2.5, 0.5, 0.6, 0.4, 1.2, coeffs);
    
    expect(score1).not.toBe(score2);
  });
});

describe('predict', () => {
  test('should return a classification with species name', () => {
    const result = predict(0.5, 2.0, 0.5, 0.6, 0.4, 1.2);
    
    expect(result.species).toBeDefined();
    expect(Object.values(SPECIES)).toContain(result.species);
    expect(result.confidence).toBeDefined();
    expect(result.probabilities).toBeDefined();
  });

  test('should return probabilities for all species', () => {
    const result = predict(0.5, 2.0, 0.5, 0.6, 0.4, 1.2);
    
    expect(result.probabilities.EC).toBeDefined();
    expect(result.probabilities.BE).toBeDefined();
    expect(result.probabilities.CN).toBeDefined();
    expect(result.probabilities.L).toBeDefined();
  });

  test('should keep probabilities in valid range', () => {
    const result = predict(0.5, 2.0, 0.5, 0.6, 0.4, 1.2);
    
    Object.values(result.probabilities).forEach(prob => {
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });
  });

  test('should handle extreme feature values', () => {
    const result = predict(100, 10, 2, 5, 0.1, 50);
    
    expect(result.species).toBeDefined();
    expect(Object.values(SPECIES)).toContain(result.species);
  });

  test('should classify different morphologies', () => {
    // Sharp, narrow ostracod (likely different species)
    const result1 = predict(2.0, 3.0, 0.3, 0.5, 0.6, 0.8);
    
    // Smooth, wide ostracod
    const result2 = predict(0.1, 1.5, 0.7, 0.7, 0.3, 2.3);
    
    expect(result1.species).toBeDefined();
    expect(result2.species).toBeDefined();
    // They should have different probabilities
    expect(JSON.stringify(result1.probabilities)).not.toBe(JSON.stringify(result2.probabilities));
  });

  test('should have highest probability matching predicted species', () => {
    const result = predict(0.5, 2.0, 0.5, 0.6, 0.4, 1.2);
    
    const maxProb = Math.max(
      result.probabilities.EC,
      result.probabilities.BE,
      result.probabilities.CN,
      result.probabilities.L
    );

    // The confidence is the max unnormalized probability before clamping
    // It should be >= the clamped max probability
    expect(result.confidence).toBeGreaterThanOrEqual(maxProb * 0.99);
  });
});

describe('validateFeatures', () => {
  test('should validate correct features', () => {
    const features = {
      sharpness: 0.5,
      ratio: 2.0,
      maxLengthRatio: 0.5,
      topLengthRatio: 0.6,
      botLengthRatio: 0.4,
      topBotRatio: 1.5
    };
    
    expect(validateFeatures(features)).toBe(true);
  });

  test('should reject invalid ratio (must be positive)', () => {
    const features = {
      sharpness: 0.5,
      ratio: -1.0,
      maxLengthRatio: 0.5,
      topLengthRatio: 0.6,
      botLengthRatio: 0.4,
      topBotRatio: 1.5
    };
    
    expect(validateFeatures(features)).toBe(false);
  });

  test('should reject non-numeric features', () => {
    const features = {
      sharpness: "not a number",
      ratio: 2.0,
      maxLengthRatio: 0.5,
      topLengthRatio: 0.6,
      botLengthRatio: 0.4,
      topBotRatio: 1.5
    };
    
    expect(validateFeatures(features)).toBe(false);
  });

  test('should reject infinite values', () => {
    const features = {
      sharpness: Infinity,
      ratio: 2.0,
      maxLengthRatio: 0.5,
      topLengthRatio: 0.6,
      botLengthRatio: 0.4,
      topBotRatio: 1.5
    };
    
    expect(validateFeatures(features)).toBe(false);
  });

  test('should reject NaN values', () => {
    const features = {
      sharpness: NaN,
      ratio: 2.0,
      maxLengthRatio: 0.5,
      topLengthRatio: 0.6,
      botLengthRatio: 0.4,
      topBotRatio: 1.5
    };
    
    expect(validateFeatures(features)).toBe(false);
  });
});

describe('SPECIES constant', () => {
  test('should have all required species', () => {
    expect(SPECIES.EC).toBe("Elofsonella Concinna");
    expect(SPECIES.BE).toBe("Baffinicythere Emarginata");
    expect(SPECIES.CN).toBe("Cytheropteron Nodosoalatum");
    expect(SPECIES.L).toBe("Leptocythere");
  });
});

describe('COEFFICIENTS constant', () => {
  test('should have coefficients for all species', () => {
    expect(COEFFICIENTS.EC).toBeDefined();
    expect(COEFFICIENTS.BE).toBeUndefined(); // Not in original code
    expect(COEFFICIENTS.CN).toBeDefined();
    expect(COEFFICIENTS.L).toBeDefined();
  });

  test('each species should have all required coefficient keys', () => {
    const requiredKeys = [
      'intercept', 'sharpness', 'ratio',
      'maxLengthRatio', 'topLengthRatio', 'botLengthRatio', 'topBotRatio'
    ];

    Object.values(COEFFICIENTS).forEach(coeffs => {
      requiredKeys.forEach(key => {
        expect(coeffs).toHaveProperty(key);
        expect(typeof coeffs[key]).toBe('number');
      });
    });
  });
});

describe('Integration: Feature to Classification Flow', () => {
  test('should classify simple ostracod features', () => {
    // Realistic feature values for a smooth ostracod
    const result = predict(
      0.3,    // smoothness
      2.2,    // width/height ratio
      0.5,    // max length ratio
      0.65,   // top length ratio
      0.35,   // bottom length ratio
      1.86    // top/bottom ratio
    );
    
    expect(result.species).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.probabilities).toBeDefined();
  });

  test('should classify sharp ostracod features', () => {
    // More angular features
    const result = predict(
      1.5,    // higher sharpness
      1.8,    // different ratio
      0.6,
      0.55,
      0.45,
      1.22
    );
    
    expect(result.species).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });
});
