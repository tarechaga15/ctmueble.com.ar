import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function parseNumericValue(val) {
  if (val == null) return 0;
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;
  const str = String(val).trim();
  if (!str) return 0;
  const normal = str.includes(",") ? str.replace(/\./g, "").replace(",", ".") : str;
  const num = parseFloat(normal);
  return Number.isFinite(num) ? num : 0;
}

function useAnimatedCount(targetValue, duration = 600) {
  const [current, setCurrent] = useState(targetValue);
  const currentRef = useRef(targetValue);
  const targetRef = useRef(targetValue);
  const startTimeRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    const startVal = currentRef.current;
    targetRef.current = targetValue;
    startTimeRef.current = null;

    if (Math.abs(startVal - targetValue) < 0.001) {
      currentRef.current = targetValue;
      setCurrent(targetValue);
      return;
    }

    const animate = (time) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + (targetRef.current - startVal) * easeProgress;
      currentRef.current = nextVal;
      setCurrent(nextVal);

      if (progress < 1) {
        reqRef.current = requestAnimationFrame(animate);
      } else {
        currentRef.current = targetRef.current;
        setCurrent(targetRef.current);
      }
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqRef.current !== null) {
        cancelAnimationFrame(reqRef.current);
      }
    };
  }, [targetValue, duration]);

  return current;
}

export default function AnimatedCounter({
  value,
  duration = 600,
  prefix = "",
  suffix = "",
  className,
}) {
  const numeric = parseNumericValue(value);
  const animated = useAnimatedCount(numeric, duration);
  const formatted = Math.round(animated).toLocaleString("es-AR");

  return (
    <span className={cn("tabular-nums font-semibold tracking-tight", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
