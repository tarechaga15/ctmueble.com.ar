import PropTypes from "prop-types";
import { useState } from "react";

const Stepper = ({
  steps,
  step: controlledStep,
  onStepChange,
  canAdvance = true,
  onCancel,
  onAttemptNext,
  onFinish,
  finishLabel = "Confirmar",
}) => {
  const [internalStep, setInternalStep] = useState(0);
  const isControlled = controlledStep !== undefined && onStepChange != null;
  const step = isControlled ? controlledStep : internalStep;
  const setStep = isControlled ? onStepChange : setInternalStep;

  const handleNext = () => {
    if (onAttemptNext) {
      onAttemptNext(step);
    }
    if (canAdvance && step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleFinish = () => {
    if (onAttemptNext) {
      onAttemptNext(step);
    }
    if (canAdvance && onFinish) {
      onFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex-shrink-0 p-[15px] pb-0">
        <div className="flex w-full justify-between items-center mb-[8px] mt-[8px]">
          {steps.map((stepObj, idx) => {
            const isCompleted = idx < step;
            const isActive = idx === step;

            return (
              <div className="flex flex-1 items-center flex-col" key={stepObj.label}>
                <div
                  className={`rounded-full border-2 text-center text-[14px] w-[25px] h-[25px] flex items-center justify-center
                ${
                  isCompleted
                    ? "bg-[#22c55e] text-[#fff] border-[#22c55e]"
                    : isActive
                    ? "border-[var(--primary)] text-[var(--primary)]"
                    : "border-gray-300 text-gray-400"
                }
              `}
                >
                  {idx + 1}
                </div>
                <span
                  className={`mt-[2px] mb-[4px] text-[13px] ${
                    isActive ? "font-bold text-[var(--primary)]" : "text-gray-600"
                  }`}
                >
                  {stepObj.label}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${
                      isCompleted ? "bg-[var(--primary)]" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-[15px]">
        {steps[step].component}
      </div>
      <div className="flex-shrink-0 flex justify-between mt-6 gap-2 p-[15px] pt-2 border-t border-gray-200">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
          >
            Cancelar
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2 ml-auto">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Atrás
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={!canAdvance}
            >
              Siguiente
            </button>
          ) : (
            onFinish && (
              <button
                type="button"
                className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleFinish}
                disabled={!canAdvance}
              >
                {finishLabel}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

Stepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      component: PropTypes.node,
    })
  ).isRequired,
  step: PropTypes.number,
  onStepChange: PropTypes.func,
  canAdvance: PropTypes.bool,
  onCancel: PropTypes.func,
  onAttemptNext: PropTypes.func,
  onFinish: PropTypes.func,
  finishLabel: PropTypes.string,
};

export default Stepper;
