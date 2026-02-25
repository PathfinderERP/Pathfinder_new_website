import { useState, useEffect } from "react";

export function useCountUp(target, duration = 10000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 90;
    const inc = target / steps;
    const id = setInterval(() => {
      start += inc;
      if ((inc > 0 && start >= target) || (inc < 0 && start <= target)) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(Math.floor(start));
      }
    }, Math.max(26, duration / steps));
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}
