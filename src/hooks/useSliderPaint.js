import { useEffect, useRef } from "react";

/**
 * Custom hook to dynamically paint the background gradient of range inputs based on current value.
 * Fits the HTML's style of gradient tracking for a premium feel.
 * 
 * @param {number|string} value - Current value of the slider
 * @param {number|string} [min] - Minimum value (will fallback to element's min attribute)
 * @param {number|string} [max] - Maximum value (will fallback to element's max attribute)
 * @returns {React.RefObject<HTMLInputElement>} ref to attach to the range input element
 */
export function useSliderPaint(value, min, max) {
  const sliderRef = useRef(null);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    const minVal = parseFloat(min ?? el.min ?? 0);
    const maxVal = parseFloat(max ?? el.max ?? 100);
    const currVal = parseFloat(value ?? el.value ?? 0);

    const pct = maxVal > minVal ? ((currVal - minVal) / (maxVal - minVal)) * 100 : 0;
    el.style.background = `linear-gradient(90deg, var(--teal) 0%, var(--teal2) ${pct}%, #E2E8F0 ${pct}%, #E2E8F0 100%)`;
  }, [value, min, max]);

  return sliderRef;
}
export default useSliderPaint;
