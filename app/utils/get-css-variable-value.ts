/**
 * Resolves the computed value of a CSS custom property, e.g.
 * `getCssVariableValue('--primary-main')` -> '#ff4d3f'.
 *
 * Useful where CSS variables cannot be used directly, like
 * canvas-rendered libraries (cytoscape, charts).
 */
export default function getCssVariableValue(
  variableName: string,
  element: HTMLElement = document.body
): string {
  return getComputedStyle(element).getPropertyValue(variableName).trim();
}
