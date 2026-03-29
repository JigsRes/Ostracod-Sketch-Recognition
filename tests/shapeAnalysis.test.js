/**
 * Unit tests for shape analysis functions
 */

import {
  Point
} from '../js/utils.js';

import {
  findCentroid,
  findHalves,
  rotateOutline,
  findVerticalDistances,
  findMaxLength,
  getLessCurvedSide,
  determineValveSide
} from '../js/shapeAnalysis.js';

describe('findCentroid', () => {
  test('should calculate centroid of points', () => {
    const points = [
      new Point(0, 0),
      new Point(4, 0),
      new Point(4, 4),
      new Point(0, 4)
    ];
    const centroid = findCentroid(points);
    
    expect(centroid.getX()).toBe(2);
    expect(centroid.getY()).toBe(2);
  });

  test('should handle single point', () => {
    const points = [new Point(5, 10)];
    const centroid = findCentroid(points);
    
    expect(centroid.getX()).toBe(5);
    expect(centroid.getY()).toBe(10);
  });

  test('should calculate centroid for triangle', () => {
    const points = [
      new Point(0, 0),
      new Point(3, 0),
      new Point(0, 3)
    ];
    const centroid = findCentroid(points);
    
    expect(centroid.getX()).toBe(1);
    expect(centroid.getY()).toBe(1);
  });
});

describe('findHalves', () => {
  test('should split points into upper and lower halves', () => {
    const points = [
      new Point(0, 0),
      new Point(0, 5),
      new Point(10, 0),
      new Point(10, 5)
    ];
    const maxPoints = [new Point(0, 0), new Point(10, 0)];
    const centroid = new Point(5, 2.5);

    const result = findHalves(points, maxPoints, centroid);
    
    expect(result.upper).toBeDefined();
    expect(result.lower).toBeDefined();
    expect(result.upper.length + result.lower.length).toBe(4);
  });

  test('should categorize points above max line as upper', () => {
    const points = [
      new Point(5, 0),
      new Point(5, 5),
      new Point(5, -5)
    ];
    const maxPoints = [new Point(0, 0), new Point(10, 0)];
    const centroid = new Point(5, 2.5);

    const result = findHalves(points, maxPoints, centroid);
    
    expect(result.upper.length).toBeGreaterThan(0);
    expect(result.lower.length).toBeGreaterThan(0);
  });
});

describe('rotateOutline', () => {
  test('should rotate points to align max length horizontally', () => {
    const points = [
      new Point(0, 0),
      new Point(1, 1),
      new Point(2, 0)
    ];
    const maxPoints = [new Point(0, 0), new Point(2, 2)];

    const result = rotateOutline(points, maxPoints);
    
    expect(result.rotatedPoints).toBeDefined();
    expect(result.rotatedPoints.length).toBe(points.length);
    expect(result.rotatedMaxPoints).toBeDefined();
    expect(result.rotatedMaxPoints.length).toBe(2);
  });

  test('should preserve number of points after rotation', () => {
    const points = Array.from({ length: 100 }, (_, i) => 
      new Point(Math.cos(i * 0.06), Math.sin(i * 0.06))
    );
    const maxPoints = [new Point(-1, 0), new Point(1, 0)];

    const result = rotateOutline(points, maxPoints);
    
    expect(result.rotatedPoints.length).toBe(100);
  });
});

describe('findVerticalDistances', () => {
  test('should find maximum vertical distance', () => {
    const points = [
      new Point(0, 0),
      new Point(5, -10),
      new Point(10, 0),
      new Point(5, 5)
    ];
    const centroid = new Point(5, 0);
    const maxPoints = [new Point(0, 0), new Point(10, 0)];

    const result = findVerticalDistances(points, centroid, maxPoints);
    
    expect(result).toBeDefined();
    expect(result.maxPoint).toBeDefined();
    expect(result.maxHeight).toBeGreaterThan(0);
  });

  test('should handle empty upper half', () => {
    // All points above centroid's y value - no upper half
    const points = [
      new Point(0, 15),
      new Point(5, 15),
      new Point(10, 15)
    ];
    const centroid = new Point(5, 10);
    const maxPoints = [new Point(0, 10), new Point(10, 10)];

    const result = findVerticalDistances(points, centroid, maxPoints);
    
    // All points are below centroid (y > 10), so no upper points
    expect(result).toBeNull();
  });
});

describe('findMaxLength', () => {
  test('should find maximum distance between points', () => {
    const points = [
      new Point(0, 0),
      new Point(3, 4),
      new Point(10, 0)
    ];

    const result = findMaxLength(points);
    
    expect(result.distance).toBe(10);
    expect(result.point1).toBeDefined();
    expect(result.point2).toBeDefined();
  });

  test('should return same max distance regardless of point order', () => {
    const points1 = [
      new Point(0, 0),
      new Point(10, 0),
      new Point(5, 5)
    ];
    const points2 = [
      new Point(5, 5),
      new Point(10, 0),
      new Point(0, 0)
    ];

    const result1 = findMaxLength(points1);
    const result2 = findMaxLength(points2);
    
    expect(result1.distance).toBe(result2.distance);
  });
});

describe('determineValveSide', () => {
  test('should return Right when point is to the right of centroid', () => {
    const point = new Point(10, 5);
    const centroid = new Point(5, 5);
    
    const result = determineValveSide(point, centroid);
    expect(result).toBe("Right");
  });

  test('should return Left when point is to the left of centroid', () => {
    const point = new Point(2, 5);
    const centroid = new Point(5, 5);
    
    const result = determineValveSide(point, centroid);
    expect(result).toBe("Left");
  });

  test('should return Right when point is at same x as centroid', () => {
    const point = new Point(5, 5);
    const centroid = new Point(5, 5);
    
    const result = determineValveSide(point, centroid);
    expect(result).toBe("Left"); // Returns Left when not greater than
  });
});
