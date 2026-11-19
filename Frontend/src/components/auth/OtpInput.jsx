import { useRef, useEffect } from "react";

export default function OtpInput({
  length = 6,
  value = "",
  onChange,
  hasError = false,
  disabled = false,
}) {
  const inputsRef = useRef([]);

  // Asegurar que value sea array de dígitos
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    // Foco en el primer input al montar
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join("");
    onChange?.(combined);

    if (char && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0 && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    onChange?.(pasted);
    const nextIndex = Math.min(pasted.length, length - 1);
    if (inputsRef.current[nextIndex]) {
      inputsRef.current[nextIndex].focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[index]}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`size-11 sm:size-13 rounded-xl border text-center text-xl sm:text-2xl font-bold font-mono outline-none transition-all ${
            hasError
              ? "border-destructive bg-destructive/5 text-destructive ring-2 ring-destructive/20"
              : digits[index]
              ? "border-primary bg-card text-foreground ring-2 ring-primary/20 shadow-sm"
              : "border-input bg-card text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          } disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
