'use client';

/**
 * Smart Grouping Utilities
 * Step 4 of AI-powered layer separation engine
 * Automatically groups related elements based on spatial proximity, visual similarity, and semantic meaning
 */

/**
 * Group elements by spatial proximity
 * Elements close to each other are likely related
 */
export function groupByProximity(elements, maxDistance = 50) {
  if (!elements || elements.length === 0) return [];

  const groups = [];
  const visited = new Set();

  elements.forEach((element, index) => {
    if (visited.has(index)) return;

    const group = [element];
    visited.add(index);

    // Find all nearby elements
    elements.forEach((otherElement, otherIndex) => {
      if (visited.has(otherIndex)) return;

      const distance = calculateDistance(element.bounds, otherElement.bounds);
      if (distance <= maxDistance) {
        group.push(otherElement);
        visited.add(otherIndex);
      }
    });

    if (group.length > 1) {
      groups.push({
        id: `proximity_group_${groups.length}`,
        type: 'proximity',
        elements: group,
        bounds: calculateGroupBounds(group),
        count: group.length
      });
    }
  });

  return groups;
}

/**
 * Group text elements into logical blocks
 * Text on same line or in same paragraph should be grouped
 */
export function groupTextElements(textElements) {
  if (!textElements || textElements.length === 0) return [];

  // Sort by Y position
  const sorted = [...textElements].sort((a, b) => a.bounds.minY - b.bounds.minY);

  const lines = [];
  let currentLine = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];

    // Check if on same line (Y position similar)
    const yDiff = Math.abs(current.bounds.minY - previous.bounds.minY);
    const avgHeight = (current.bounds.maxY - current.bounds.minY + previous.bounds.maxY - previous.bounds.minY) / 2;

    if (yDiff < avgHeight * 0.5) {
      currentLine.push(current);
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine = [current];
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Group lines into paragraphs
  const paragraphs = [];
  let currentParagraph = [lines[0]];

  for (let i = 1; i < lines.length; i++) {
    const currentLineGroup = lines[i];
    const previousLineGroup = lines[i - 1];

    const prevBottom = Math.max(...previousLineGroup.map(t => t.bounds.maxY));
    const currTop = Math.min(...currentLineGroup.map(t => t.bounds.minY));
    const gap = currTop - prevBottom;

    const avgLineHeight = previousLineGroup.reduce((sum, t) => sum + (t.bounds.maxY - t.bounds.minY), 0) / previousLineGroup.length;

    // If gap is small, same paragraph
    if (gap < avgLineHeight * 1.5) {
      currentParagraph.push(currentLineGroup);
    } else {
      paragraphs.push(currentParagraph);
      currentParagraph = [currentLineGroup];
    }
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph);
  }

  return paragraphs.map((paragraph, index) => {
    const allElements = paragraph.flat();
    return {
      id: `text_group_${index}`,
      type: 'text_block',
      elements: allElements,
      bounds: calculateGroupBounds(allElements),
      lineCount: paragraph.length,
      text: allElements.map(e => e.text).join(' ')
    };
  });
}

/**
 * Group objects by visual similarity (size, aspect ratio)
 * Icons, buttons, cards of similar size should be grouped
 */
export function groupBySimilarity(objects, tolerances = {}) {
  const {
    sizeTolerance = 0.3,      // 30% size difference allowed
    aspectTolerance = 0.2     // 20% aspect ratio difference allowed
  } = tolerances;

  if (!objects || objects.length === 0) return [];

  const groups = [];
  const visited = new Set();

  objects.forEach((obj, index) => {
    if (visited.has(index)) return;

    const objSize = (obj.bounds.maxX - obj.bounds.minX) * (obj.bounds.maxY - obj.bounds.minY);
    const objAspect = (obj.bounds.maxX - obj.bounds.minX) / (obj.bounds.maxY - obj.bounds.minY);

    const group = [obj];
    visited.add(index);

    objects.forEach((other, otherIndex) => {
      if (visited.has(otherIndex)) return;

      const otherSize = (other.bounds.maxX - other.bounds.minX) * (other.bounds.maxY - other.bounds.minY);
      const otherAspect = (other.bounds.maxX - other.bounds.minX) / (other.bounds.maxY - other.bounds.minY);

      const sizeDiff = Math.abs(objSize - otherSize) / Math.max(objSize, otherSize);
      const aspectDiff = Math.abs(objAspect - otherAspect) / Math.max(objAspect, otherAspect);

      if (sizeDiff <= sizeTolerance && aspectDiff <= aspectTolerance) {
        group.push(other);
        visited.add(otherIndex);
      }
    });

    if (group.length > 1) {
      groups.push({
        id: `similarity_group_${groups.length}`,
        type: 'similar_objects',
        elements: group,
        bounds: calculateGroupBounds(group),
        count: group.length,
        avgSize: group.reduce((sum, e) => sum + ((e.bounds.maxX - e.bounds.minX) * (e.bounds.maxY - e.bounds.minY)), 0) / group.length
      });
    }
  });

  return groups;
}

/**
 * Detect UI component patterns (buttons, cards, forms)
 */
export function detectUIComponents(objects, textElements) {
  const components = [];

  // Detect buttons (small objects with text nearby)
  objects.forEach(obj => {
    const objCenter = {
      x: (obj.bounds.minX + obj.bounds.maxX) / 2,
      y: (obj.bounds.minY + obj.bounds.maxY) / 2
    };

    const nearbyText = textElements.filter(text => {
      const textCenter = {
        x: (text.bounds.minX + text.bounds.maxX) / 2,
        y: (text.bounds.minY + text.bounds.maxY) / 2
      };

      const distance = Math.sqrt(
        Math.pow(objCenter.x - textCenter.x, 2) +
        Math.pow(objCenter.y - textCenter.y, 2)
      );

      return distance < 100; // Within 100px
    });

    if (nearbyText.length > 0) {
      const objWidth = obj.bounds.maxX - obj.bounds.minX;
      const objHeight = obj.bounds.maxY - obj.bounds.minY;
      const aspectRatio = objWidth / objHeight;

      // Button-like: wider than tall, moderate size
      if (aspectRatio > 1.5 && objWidth > 50 && objWidth < 300 && objHeight > 20 && objHeight < 80) {
        components.push({
          id: `button_${components.length}`,
          type: 'button',
          elements: [obj, ...nearbyText],
          bounds: calculateGroupBounds([obj, ...nearbyText]),
          label: nearbyText.map(t => t.text).join(' ')
        });
      }
    }
  });

  // Detect cards (rectangular containers with multiple elements inside)
  objects.forEach(obj => {
    const objArea = (obj.bounds.maxX - obj.bounds.minX) * (obj.bounds.maxY - obj.bounds.minY);

    // Large enough to be a container
    if (objArea > 10000) {
      const containedElements = [...objects, ...textElements].filter(element => {
        if (element === obj) return false;

        return (
          element.bounds.minX >= obj.bounds.minX &&
          element.bounds.maxX <= obj.bounds.maxX &&
          element.bounds.minY >= obj.bounds.minY &&
          element.bounds.maxY <= obj.bounds.maxY
        );
      });

      if (containedElements.length >= 2) {
        components.push({
          id: `card_${components.length}`,
          type: 'card',
          container: obj,
          elements: containedElements,
          bounds: obj.bounds,
          childCount: containedElements.length
        });
      }
    }
  });

  return components;
}

/**
 * Detect icon sets (small, similar-sized objects in a row/grid)
 */
export function detectIconSets(objects) {
  const smallObjects = objects.filter(obj => {
    const width = obj.bounds.maxX - obj.bounds.minX;
    const height = obj.bounds.maxY - obj.bounds.minY;
    const area = width * height;

    // Icons are typically small and roughly square
    return area < 5000 && Math.abs(width - height) / Math.max(width, height) < 0.3;
  });

  const iconSets = groupBySimilarity(smallObjects, {
    sizeTolerance: 0.2,
    aspectTolerance: 0.15
  });

  // Check if they're arranged in a row or grid
  return iconSets.map(set => {
    const elements = set.elements;
    const yPositions = elements.map(e => (e.bounds.minY + e.bounds.maxY) / 2);
    const xPositions = elements.map(e => (e.bounds.minX + e.bounds.maxX) / 2);

    const yVariance = calculateVariance(yPositions);
    const xVariance = calculateVariance(xPositions);

    const isHorizontalRow = yVariance < 100; // Low Y variance = horizontal
    const isVerticalColumn = xVariance < 100; // Low X variance = vertical

    return {
      ...set,
      type: 'icon_set',
      arrangement: isHorizontalRow ? 'horizontal' : isVerticalColumn ? 'vertical' : 'grid'
    };
  });
}

/**
 * Smart grouping main function
 * Combines all grouping strategies
 */
export function performSmartGrouping(objects, textElements) {
  const groups = [];

  // 1. Group text into blocks
  const textGroups = groupTextElements(textElements);
  groups.push(...textGroups);

  // 2. Detect UI components
  const uiComponents = detectUIComponents(objects, textElements);
  groups.push(...uiComponents);

  // 3. Detect icon sets
  const iconSets = detectIconSets(objects);
  groups.push(...iconSets);

  // 4. Group remaining objects by proximity
  const ungroupedObjects = objects.filter(obj => {
    return !groups.some(group => 
      group.elements?.includes(obj) || group.container === obj
    );
  });

  const proximityGroups = groupByProximity(ungroupedObjects, 50);
  groups.push(...proximityGroups);

  // 5. Group by similarity
  const similarityGroups = groupBySimilarity(ungroupedObjects);
  groups.push(...similarityGroups);

  return groups;
}

/**
 * Helper: Calculate distance between two bounding boxes
 */
function calculateDistance(bounds1, bounds2) {
  const center1 = {
    x: (bounds1.minX + bounds1.maxX) / 2,
    y: (bounds1.minY + bounds1.maxY) / 2
  };

  const center2 = {
    x: (bounds2.minX + bounds2.maxX) / 2,
    y: (bounds2.minY + bounds2.maxY) / 2
  };

  return Math.sqrt(
    Math.pow(center1.x - center2.x, 2) +
    Math.pow(center1.y - center2.y, 2)
  );
}

/**
 * Helper: Calculate bounding box for a group of elements
 */
function calculateGroupBounds(elements) {
  if (!elements || elements.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  elements.forEach(element => {
    if (element.bounds) {
      minX = Math.min(minX, element.bounds.minX);
      minY = Math.min(minY, element.bounds.minY);
      maxX = Math.max(maxX, element.bounds.maxX);
      maxY = Math.max(maxY, element.bounds.maxY);
    }
  });

  return { minX, minY, maxX, maxY };
}

/**
 * Helper: Calculate variance of an array
 */
function calculateVariance(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}