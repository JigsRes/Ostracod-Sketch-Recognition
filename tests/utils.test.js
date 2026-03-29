/**
 * Unit tests for utility functions
 */

import {
  Point,
  initializeDelta,
  initializeTheta,
  removeDuplicatePoints,
  resampleSpacing,
  getApproxXCoordinate
} from '../js/utils.js';

describe('Point Class', () => {
  test('should create a point with x and y coordinates', () => {
    const p = new Point(10, 20);
    expect(p.getX()).toBe(10);
    expect(p.getY()).toBe(20);
  });

  test('should calculate Euclidean distance correctly', () => {
    const p1 = new Point(0, 0);
    const p2 = new Point(3, 4);
    expect(p1.distance(p2)).toBe(5);
  });

  test('should calculate distance with separate x,y parameters', () => {
    const p = new Point(0, 0);
    expect(p.distance(3, 4)).toBe(5);
  });

  test('should calculate squared distance', () => {
    const p1 = new Point(0, 0);
    const p2 = new Point(3, 4);
    expect(p1.distanceSquared(p2)).toBe(25);
  });

  test('should generate unique IDs', () => {
    const p1 = new Point(10, 20);
    const p2 = new Point(10, 20);
    expect(p1.getId()).not.toBe(p2.getId());
  });

  test('should allow setting x and y', () => {
    const p = new Point(10, 20);
    p.setX(30);
    p.setY(40);
    expect(p.getX()).toBe(30);
    expect(p.getY()).toBe(40);
  });
});

describe('initializeDelta', () => {
  test('should calculate delta changes between consecutive points', () => {
    const points = [
      new Point(0, 0),
      new Point(1, 1),
      new Point(3, 2)
    ];
    const result = initializeDelta(points);
    
    expect(result.deltaX).toEqual([1, 2]);
    expect(result.deltaY).toEqual([1, 1]);
  });

  test('should handle empty or single point array', () => {
    const points = [new Point(0, 0)];
    const result = initializeDelta(points);
    
    expect(result.deltaX).toEqual([]);
    expect(result.deltaY).toEqual([]);
  });
});

describe('initializeTheta', () => {
  test('should calculate angles between vectors', () => {
    const deltaX = [1, 1, 0];
    const deltaY = [0, 1, 1];
    const result = initializeTheta(deltaX, deltaY);
    
    expect(result.length).toBe(2);
    // Cross product: 1*0 - 1*1 = -1, Dot product: 1*1 + 1*0 = 1 => atan(-1/1) = -π/4
    expect(result[0]).toBeCloseTo(-Math.PI / 4, 5);
  });

  test('should skip zero dot products', () => {
    // When vectors are perpendicular, we might skip the calculation
    const deltaX = [1, 0];
    const deltaY = [0, 1];
    const result = initializeTheta(deltaX, deltaY);
    
    // This should not cause an error
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('removeDuplicatePoints', () => {
  test('should remove consecutive duplicate points', () => {
    const points = [
      new Point(0, 0),
      new Point(0, 0),
      new Point(1, 1),
      new Point(1, 1),
      new Point(2, 2)
    ];
    const result = removeDuplicatePoints(points);
    
    expect(result.length).toBe(3);
    expect(result[0].getX()).toBe(0);
    expect(result[1].getX()).toBe(1);
    expect(result[2].getX()).toBe(2);
  });

  test('should not remove non-consecutive duplicates', () => {
    const points = [
      new Point(0, 0),
      new Point(1, 1),
      new Point(0, 0)
    ];
    const result = removeDuplicatePoints(points);
    
    expect(result.length).toBe(3);
  });
});

describe('resampleSpacing', () => {
  test('should calculate spacing based on diagonal', () => {
    const points = [
      new Point(0, 0),
      new Point(100, 0),
      new Point(100, 100),
      new Point(0, 100)
    ];
    const spacing = resampleSpacing(points);
    
    // Diagonal is ~141.42, so spacing should be ~3.5
    expect(spacing).toBeGreaterThan(0);
    expect(spacing).toBeLessThan(10);
  });
});

describe('getApproxXCoordinate', () => {
  test('should find point closest to x coordinate', () => {
    const points = [
      new Point(0, 10),
      new Point(5, 20),
      new Point(10, 30),
      new Point(15, 40)
    ];
    
    const result = getApproxXCoordinate(points, 7);
    expect(result.getX()).toBe(5);
  });

  test('should handle exact x coordinate match', () => {
    const points = [
      new Point(0, 10),
      new Point(5, 20),
      new Point(10, 30)
    ];
    
    const result = getApproxXCoordinate(points, 5);
    expect(result.getX()).toBe(5);
  });
});
