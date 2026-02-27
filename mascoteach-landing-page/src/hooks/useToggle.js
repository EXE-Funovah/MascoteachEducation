import { useState, useCallback } from 'react';

/**
 * Custom hook for toggle state management
 * Used for Pricing toggle (monthly/yearly), mobile menu, etc.
 */
export function useToggle(initialState = false) {
  const [isOn, setIsOn] = useState(initialState);

  const toggle = useCallback(() => setIsOn((prev) => !prev), []);
  const setOn = useCallback(() => setIsOn(true), []);
  const setOff = useCallback(() => setIsOn(false), []);

  return { isOn, toggle, setOn, setOff };
}
