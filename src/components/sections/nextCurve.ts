/** The viewport onto the closing scene, in viewBox units: the camera follows the sentence along the curve. */
export const VIEW = { width: 1000, height: 500 };

/** Horizontal extent of the curve, wider than the view: the sentence is typed along it. */
export const CURVE_X = { start: -100, end: 3400 };

export const CURVE = `M ${CURVE_X.start} 360 C 300 120, 700 480, 1100 300 S 1900 130, 2300 300 S 3000 470, ${CURVE_X.end} 240`;
