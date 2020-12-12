import { modes } from './constants.js';

/**
 * Changes the cursor style
 * @param {String} mode
 */
export function handleCursorType(mode) {
  let type = 'crosshair';

  switch (mode) {
    case modes.draw:
      type = 'crosshair';
      break;

    case modes.text:
      type = 'text';
      break;
  }

  document.body.style.cursor = type;
}
