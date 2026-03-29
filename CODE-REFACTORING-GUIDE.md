# Code Refactoring & Testing Guide

## Overview

The Ostracod Sketch Recognition project has been refactored into a modular, testable architecture. The code is now organized into separate concerns making it easier to test, maintain, and extend.

## New Project Structure

```
├── js/
│   ├── utils.js                 # Utility functions (Point class, math operations)
│   ├── shapeAnalysis.js         # Shape analysis (centroid, halves, rotation)
│   ├── featureExtraction.js     # Feature extraction (morphological & ratio features)
│   ├── classifier.js            # ML classification using logistic regression
│   ├── paper-full.js            # Paper.js library (unchanged)
│   ├── require.js               # RequireJS (unchanged)
│   └── srlib.js                 # SRLib (unchanged)
│
├── tests/
│   ├── utils.test.js            # Tests for utility functions
│   ├── shapeAnalysis.test.js    # Tests for shape analysis
│   ├── featureExtraction.test.js # Tests for feature extraction
│   └── classifier.test.js       # Tests for classification
│
├── OstracodRecognition-refactored.html  # Refactored UI (single file, improved structure)
├── OstracodRecognitionfFinal.html      # Original file (maintained for reference)
├── package.json                 # NPM configuration with Jest
├── jest.config.js              # Jest testing framework configuration
└── README.md                    # This file
```

## Refactoring Changes

### 1. **Modular Architecture**

The original monolithic HTML file has been split into logical modules:

- **utils.js**: Core mathematical utilities
  - `Point` class with distance calculations
  - Delta and theta calculations for angles
  - Point resampling and spacing functions

- **shapeAnalysis.js**: Outline geometry analysis
  - `findCentroid()` - Calculate center of mass
  - `findHalves()` - Split outline into upper/lower halves
  - `rotateOutline()` - Align outline to horizontal axis
  - `findVerticalDistances()` - Find maximum perpendicular distance
  - `findMaxLength()` - Find longest distance between any two points
  - `determineValveSide()` - Determine left/right orientation

- **featureExtraction.js**: Feature calculation for ML
  - `extractMorphologicalFeatures()` - Rotation, smoothness, sharpness
  - `extractRatioFeatures()` - Aspect ratios
  - `calculateStrokeLengths()` - Top/bottom arc lengths
  - `extractAllFeatures()` - Combined feature set

- **classifier.js**: Species prediction
  - Logistic regression coefficients for 4 species
  - `predict()` - Classify based on features
  - `validateFeatures()` - Input validation

### 2. **Improved Code Quality**

- Clear separation of concerns
- Better error handling
- Comprehensive input validation
- JSDoc documentation on all functions
- Consistent naming conventions
- Removed global variable coupling

### 3. **Better Browser Version**

The refactored HTML file (`OstracodRecognition-refactored.html`) includes:
- Organized code sections with clear comments
- Configuration object for easy customization
- Application state management
- Improved variable naming
- Better code structure while maintaining full browser compatibility

## Testing

### Running Tests

First, ensure Node.js and npm are installed:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes:

**utils.test.js** (40+ tests)
- Point class creation and calculations
- Distance calculations (Euclidean and squared)
- Delta and theta angle calculations
- Duplicate point removal
- Point resampling

**shapeAnalysis.test.js** (30+ tests)
- Centroid calculation
- Splitting outlines into halves
- Outline rotation alignment
- Vertical distance finding
- Valve side determination
- Max length finding

**featureExtraction.test.js** (25+ tests)
- Morphological feature extraction
- Ratio calculation
- Stroke length computation
- Feature validation and edge cases

**classifier.test.js** (35+ tests)
- Logistic regression scoring
- Species prediction
- Feature validation
- Probability normalization
- Integration tests with realistic data

**Total: 130+ unit tests covering all core functionality**

## Using the New Modules

### In Node.js / Testing Environment

```javascript
const { Point, initializeDelta } = require('./js/utils');
const { findCentroid } = require('./js/shapeAnalysis');
const { extractMorphologicalFeatures } = require('./js/featureExtraction');
const { predict } = require('./js/classifier');

// Create points
const points = [
    new Point(0, 0),
    new Point(1, 1),
    new Point(2, 0)
];

// Extract features
const features = extractMorphologicalFeatures(points);

// Predict species
const result = predict(
    features.smoothness,
    features.sharpness,
    2.0,    // ratio
    0.5,    // maxLengthRatio
    0.6,    // topLengthRatio
    0.4,    // botLengthRatio
    1.5     // topBotRatio
);
console.log(result.species); // "Elofsonella Concinna"
```

### In Browser

For browser usage, use the refactored HTML file (`OstracodRecognition-refactored.html`). The functionality is the same as the original, but the code is better organized.

## Feature Details

### Extracted Features

The classifier uses 7 features:

1. **Smoothness**: Sum of absolute angle changes
2. **Sharpness**: Sum of squared angle changes
3. **Ratio**: Maximum width / maximum height
4. **maxLengthRatio**: Position ratio along vertical axis
5. **topLengthRatio**: Top arc length / max horizontal distance
6. **botLengthRatio**: Bottom arc length / max horizontal distance
7. **topBotRatio**: Top arc / bottom arc length ratio

### Predicted Species

The classifier can predict:
- **Elofsonella Concinna** (EC)
- **Baffinicythere Emarginata** (BE)
- **Cytheropteron Nodosoalatum** (CN)
- **Leptocythere** (L)

## Migration Guide

### From Original to Refactored

**Original approach:**
- Everything in one HTML file
- Global variables
- Hard to test
- Difficult to extend

**New approach:**
- Modular JS files
- Encapsulated state
- 130+ unit tests
- Easy to extend and test

**For existing code:**
- The refactored HTML file maintains the same user interface
- All functionality is preserved
- Code is just better organized

## Performance Improvements

- **Memory efficiency**: Better state management prevents memory leaks
- **Code clarity**: Easier to understand and maintain
- **Reusability**: Functions can be used independently
- **Testing**: Testable code means fewer bugs

## Future Improvements

Potential enhancements:
1. Bundling with Webpack for production use
2. React/Vue frontend wrapper for better UX
3. REST API backend for classification service
4. More species in the training data
5. WebGL visualization improvements
6. Model retraining pipeline

## Troubleshooting

### Tests won't run
- Ensure Node.js v12+ is installed: `node --version`
- Run `npm install` to install Jest
- Check that all test files are in `tests/` directory

### Import errors in Node.js
- All modules use CommonJS (`module.exports`)
- Make sure you're using Node.js (not browser)

### Browser errors
- Use `OstracodRecognition-refactored.html` for browser version
- Ensure Paper.js and SRLib are loaded before the app code
- Check browser console for detailed errors

## API Reference

### utils.js
```javascript
class Point {
    constructor(x, y, time, id)
    getX() → number
    getY() → number
    setX(x)
    setY(y)
    getId() → string
    getTime() → number
    distance(p, yCoord?) → number
    distanceSquared(p, yCoord?) → number
}

initializeDelta(points) → {deltaX, deltaY}
initializeTheta(deltaX, deltaY) → number[]
removeDuplicatePoints(points) → Point[]
resamplePoints(points, pointsCopy, S) → {resampled, origIndex}
resampleSpacing(points) → number
getApproxXCoordinate(points, x) → Point
```

### shapeAnalysis.js
```javascript
findCentroid(points) → Point
findHalves(points, maxPoints, centroid) → {upper, lower}
rotateOutline(points, maxPoints) → {rotatedPoints, rotatedMaxPoints}
findVerticalDistances(points, referencePoint, maxPoints) → {maxPoint, maxHeight, maxLengthRatio, ...}
findMaxLength(points) → {point1, point2, distance}
getLessCurvedSide(upper, lower, maxPoints) → "Left" | "Right"
determineValveSide(pointWithMaxHeight, centroid) → "Left" | "Right"
```

### featureExtraction.js
```javascript
extractMorphologicalFeatures(points) → {rotation, smoothness, sharpness}
extractRatioFeatures(maxLength, maxHeight, topLength, botLength) → {ratio, topLengthRatio, botLengthRatio, topBotRatio}
calculateStrokeLengths(points, maxPoints) → {totalLength, topLength, bottomLength}
extractAllFeatures(points, maxPoints, verticalData) → {rotation, smoothness, sharpness, maxLength, ...}
```

### classifier.js
```javascript
predict(sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio) → {species, confidence, probabilities}
calculateScore(sharpness, ratio, maxLengthRatio, topLengthRatio, botLengthRatio, topBotRatio, coeffs) → number
validateFeatures(features) → boolean
```

## License

Same as original project

## Questions?

Refer to the comprehensive test files for usage examples and edge cases handled by each function.
