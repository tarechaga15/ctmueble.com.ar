import { useEffect, useRef, useState, useLayoutEffect } from "react";

/**
 * @param {Object} props
 * @param {string} [props.status] - Estado del ensayo (para steps por defecto)
 * @param {string} [props.subStatus]
 * @param {"horizontal"|"horizontalCompact"|"vertical"} [props.variant]
 * @param {string} [props.backgroundColor]
 * @param {React.ReactNode} [props.icon] - Icono global a la izquierda de la barra (usado si el step activo no tiene icon)
 * @param {Array<{ id: string, label: string, description?: string, icon?: React.ReactNode, cancelled?: boolean }>} [props.steps] - Steps customizados; si se pasan, se ignora status/subStatus
 * @param {number} [props.activeStepIndex] - Índice del step activo (0-based). Usado con steps customizados.
 * @param {string} [props.activeStepId] - Id del step activo. Alternativa a activeStepIndex cuando se usan steps customizados.
 */
export default function ProcessProgressBar({ status, subStatus, variant = "horizontal", backgroundColor, icon, steps: customSteps, activeStepIndex: customActiveIndex, activeStepId: customActiveId }) {
  const stepRefs = useRef([]);

  // Función para determinar los steps del proceso según el estado vigente en backend:
  // REQUESTED -> ACCEPTED | REJECTED -> SERVICE_AGREEMENT_MADED -> IN_WORK -> COMPLETED | CANCELLED
  const getProcessSteps = () => {
    const currentStatus = status;
    const currentSubStatus = subStatus;

    if (currentStatus === "REQUESTED") {
      return [
        { id: "requested", label: "Solicitud enviada", description: "Se envió la solicitud de ensayo al laboratorio.", completed: true, active: true },
        { id: "waiting_approval", label: "Espera de aprobación", description: "El laboratorio revisará y aceptará o rechazará la solicitud.", completed: false, active: false },
        { id: "contract", label: "Contrato", description: "Se generará el acuerdo de servicio para firmar.", completed: false, active: false },
        { id: "in_work", label: "En trabajo", description: "Recepción de muestras, análisis y finalización.", completed: false, active: false },
        { id: "completed_process", label: "Completado", description: "Ensayo finalizado e informe disponible.", completed: false, active: false },
      ];
    }

    if (currentStatus === "ACCEPTED") {
      return [
        { id: "requested", label: "Solicitud enviada", description: "Se envió la solicitud de ensayo al laboratorio.", completed: true, active: false },
        { id: "waiting_approval", label: "Aceptado", description: "El laboratorio aceptó la solicitud.", completed: true, active: true },
        { id: "contract", label: "Contrato", description: "Se generará el acuerdo de servicio para firmar.", completed: false, active: false },
        { id: "in_work", label: "En trabajo", description: "Recepción de muestras, análisis y finalización.", completed: false, active: false },
        { id: "completed_process", label: "Completado", description: "Ensayo finalizado e informe disponible.", completed: false, active: false },
      ];
    }

    if (currentStatus === "SERVICE_AGREEMENT_MADED") {
      return [
        { id: "requested", label: "Solicitud enviada", description: "Se envió la solicitud de ensayo al laboratorio.", completed: true, active: false },
        { id: "waiting_approval", label: "Aceptado", description: "El laboratorio aceptó la solicitud.", completed: true, active: false },
        { id: "contract", label: "Contrato generado", description: "El contrato fue generado. Pendiente firma y envío de muestras.", completed: true, active: true },
        { id: "in_work", label: "En trabajo", description: "Recepción de muestras, análisis y finalización.", completed: false, active: false },
        { id: "completed_process", label: "Completado", description: "Ensayo finalizado e informe disponible.", completed: false, active: false },
      ];
    }

    if (currentStatus === "IN_WORK") {
      const steps = [
        { id: "requested", label: "Solicitud enviada", description: "Se envió la solicitud de ensayo al laboratorio.", completed: true, active: false },
        { id: "waiting_approval", label: "Aceptado", description: "El laboratorio aceptó la solicitud.", completed: true, active: false },
        { id: "contract", label: "Contrato generado", description: "El contrato fue generado.", completed: true, active: false },
        { id: "in_work", label: "En trabajo", description: "El laboratorio está trabajando en su ensayo.", completed: true, active: true },
        { id: "completed_process", label: "Completado", description: "Ensayo finalizado e informe disponible.", completed: false, active: false },
      ];
      if (currentSubStatus === "WAITING_SAMPLES" || !currentSubStatus) {
        steps[3].label = "Entrega de muestras";
        steps[3].description = "Pendiente de recepción de muestras en el laboratorio.";
      } else if (currentSubStatus === "ANALYZING") {
        steps[3].label = "Analizando";
        steps[3].description = "Las muestras están siendo analizadas.";
      } else if (currentSubStatus === "FINALIZING" || currentSubStatus === "FINALIZADO" || currentSubStatus === "FINALIZED") {
        steps[3].label = "Finalizando";
        steps[3].description = "Se están finalizando los resultados y el informe.";
      }
      return steps;
    }

    if (currentStatus === "COMPLETED") {
      return [
        { id: "completed", label: "Ensayo completado", description: "El ensayo ha finalizado. El informe está disponible para descarga.", completed: true, active: false },
      ];
    }

    if (currentStatus === "REJECTED" || currentStatus === "CANCELLED") {
      return [
        {
          id: "cancelled",
          label: currentStatus === "REJECTED" ? "Ensayo rechazado" : "Ensayo cancelado",
          description: currentStatus === "REJECTED" ? "El laboratorio rechazó la solicitud de ensayo." : "El ensayo fue cancelado.",
          completed: false,
          active: false,
          cancelled: true,
        },
      ];
    }

    return [
      { id: "pending", label: "Pendiente", description: "El estado del proceso se está actualizando.", completed: false, active: true },
    ];
  };

  // Steps: customizados o derivados de status/subStatus
  const processSteps = (() => {
    if (customSteps && customSteps.length > 0) {
      const activeIndex = customActiveIndex != null && customActiveIndex >= 0
        ? Math.min(customActiveIndex, customSteps.length - 1)
        : (customActiveId != null
          ? customSteps.findIndex((s) => s.id === customActiveId)
          : -1);
      const idx = activeIndex >= 0 ? activeIndex : 0;
      return customSteps.map((s, i) => ({
        id: s.id,
        label: s.label,
        description: s.description ?? "",
        icon: s.icon,
        cancelled: s.cancelled ?? false,
        completed: i < idx,
        active: i === idx,
      }));
    }
    return getProcessSteps();
  })();

  const hasCustomSteps = Boolean(customSteps && customSteps.length > 0);
  const activeStep = processSteps.find((s) => s.active);
  const displayIcon = activeStep?.icon ?? icon;

  // Calcular el progreso de la línea roja
  const getProgressLineWidth = () => {
    if (processSteps.length <= 1) return null;
    
    let lastCompletedIndex = -1;
    let activeIndex = -1;
    
    processSteps.forEach((step, index) => {
      if (step.completed) lastCompletedIndex = index;
      if (step.active) activeIndex = index;
    });
    
    const targetIndex = activeIndex !== -1 ? activeIndex : lastCompletedIndex;
    
    if (targetIndex === -1 || targetIndex === 0) return null;
    
    const progressPercent = (targetIndex / (processSteps.length - 1)) * 100;
    const circleRadius = 4; // w-[8px] / 2 = 4px
    
    return {
      width: `calc(${progressPercent}% - ${circleRadius * 2}px)`,
      left: `${circleRadius}px`,
    };
  };

  const progressLineStyle = getProgressLineWidth();

  // Calcular el ancho del conector entre steps - ahora determinado por el ancho del contenedor del step
  // Fix: Forzar recalculo del ancho al montar y cuando cambian los steps.
  // Guardamos el ancho de cada conector en estado para que persista al cambiar de tab
  const [connectorWidths, setConnectorWidths] = useState([]);
  useLayoutEffect(() => {
    if (!stepRefs.current) return;

    const widths = processSteps.map((_, index) => {
      if (index >= processSteps.length - 1) return "40px";
      const stepContainer = stepRefs.current[index];
      if (stepContainer) {
        const containerWidth = stepContainer.offsetWidth;
        return `${Math.max(containerWidth - 16, 16)}px`;
      }
      return "40px";
    });
    setConnectorWidths(widths);
    // eslint-disable-next-line
  }, [processSteps.length, status, subStatus]);

  const getConnectorWidth = (index) => {
    if (connectorWidths && connectorWidths[index]) {
      return connectorWidths[index];
    }
    return "40px";
  };

  // No mostrar la barra horizontal si el estado es COMPLETED (solo cuando no hay steps customizados)
  if (!hasCustomSteps && variant === "horizontal" && status === "COMPLETED") {
    return null;
  }
  if (!hasCustomSteps && variant === "horizontalCompact" && status === "COMPLETED") {
    return null;
  }

  const wrapperStyle = backgroundColor ? { backgroundColor } : undefined;
  const wrapperClass = "mb-[10px] p-[20px] rounded-[10px] " + (!backgroundColor ? "bg-gray-50" : "");

  if (variant === "vertical") {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Estado del proceso</h3>
        <div className="flex items-start gap-3">
          {displayIcon != null && (
            <div className="flex-shrink-0 flex items-center justify-center text-gray-500 pt-0.5" style={{ width: "24px" }} aria-hidden>
              {displayIcon}
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col">
          {processSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-stretch"
            >
              {processSteps.length > 1 && (
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: "16px" }}>
                <div
                  className={`
                    w-[16px] h-[16px] rounded-full flex items-center justify-center
                    border-2 border-[#d1d5db] transition-all duration-200 relative
                    ${step.cancelled
                      ? "bg-white border-[var(--primary)] border-dashed"
                      : step.completed
                      ? "bg-[var(--primary)] border-[var(--primary)]"
                      : step.active
                      ? "bg-white border-[var(--primary)] border-dashed"
                      : "bg-gray-300 border-gray-300"
                    }
                  `}
                  style={{ flexShrink: 0, minWidth: "16px", minHeight: "16px" }}
                />
                {index < processSteps.length - 1 && (
                  <div
                    className="flex-1 min-h-[20px]"
                    style={{
                      width: "2px",
                      backgroundColor: step.completed ? "var(--primary)" : "#d1d5db",
                    }}
                  />
                )}
              </div>
              )}
              {/* Columna derecha: título (siempre visible) */}
              <div className={"flex-1 " + (processSteps.length > 1 ? "pl-[10px]" : "pl-0")}>
                <div className={index < processSteps.length - 1 ? "mb-4" : ""}>
                  <p
                    className={`
                      text-sm font-medium m-[0px]
                      ${step.active || step.completed ? "text-[var(--primary)]" : step.cancelled ? "text-[var(--primary)]" : "text-gray-500"}
                      ${step.active || step.completed ? "font-bold" : ""}
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  }

  // Modo horizontal compacto: título + descripción arriba; icono opcional a la izquierda de la barra
  if (variant === "horizontalCompact") {
    const dotSizePx = 16;
    const smallDotSizePx = 8;
    const rowHeightPx = 24;
    const lineTop = (rowHeightPx - 2) / 2;

    // Línea de centro del primer punto al centro del último (columnas flex-1 iguales)
    const N = processSteps.length;
    const trackStartPercent = N > 1 ? (0.5 / N) * 100 : 0; // centro del primer paso
    const trackWidthPercent = N > 1 ? ((N - 1) / N) * 100 : 100; // hasta centro del último
    let lastCompletedIdx = -1;
    let activeIdx = -1;
    processSteps.forEach((step, i) => {
      if (step.completed) lastCompletedIdx = i;
      if (step.active) activeIdx = i;
    });
    const targetIdx = activeIdx !== -1 ? activeIdx : lastCompletedIdx;
    const progressWidthPercent =
      N > 1 && targetIdx >= 0 ? (targetIdx / (N - 1)) * trackWidthPercent : 0;

    return (
      <div className={wrapperClass} style={wrapperStyle}>
        {/* Título y descripción del step actual al inicio; icono a la altura de los textos */}
        {activeStep && (
          <div className="mb-4 flex items-center gap-3 mb-[20px]">
            {displayIcon != null && (
              <div className="mr-2 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden>
                {displayIcon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`
                  m-0 font-heading text-base font-medium
                  ${activeStep.active || activeStep.completed || activeStep.cancelled ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                {activeStep.label}
              </p>
              {activeStep.description && (
                <p className="m-0 mt-1 text-sm leading-snug text-muted-foreground">
                  {activeStep.description}
                </p>
              )}
            </div>
          </div>
        )}
        {/* Barra de puntos y líneas: solo si hay más de un step */}
        {N > 1 && (
        <div className="relative" style={{ minHeight: `${rowHeightPx}px` }}>
          <>
            {/* 1) Pista completa en gris (tramo incompleto siempre visible) */}
            <div
              className="absolute rounded-full"
              style={{
                height: "2px",
                top: `${lineTop}px`,
                left: `${trackStartPercent}%`,
                width: `${trackWidthPercent}%`,
                backgroundColor: "#9ca3af",
                zIndex: 0,
              }}
            />
            {/* 2) Progreso rojo encima del tramo completado */}
            {progressWidthPercent > 0 && (
              <div
                className="absolute bg-[var(--primary)] rounded-full transition-all duration-500"
                style={{
                  height: "2px",
                  top: `${lineTop}px`,
                  left: `${trackStartPercent}%`,
                  width: `${progressWidthPercent}%`,
                  zIndex: 1,
                }}
              />
            )}
          </>
          {/* Puntos encima de las líneas (sin conectores, la línea ya une visualmente) */}
          <div
            className="flex justify-between relative items-center"
            style={{ minHeight: `${rowHeightPx}px`, zIndex: 1 }}
          >
            {processSteps.map((step, index) => {
              const isActive = step.active;
              const size = isActive ? dotSizePx : smallDotSizePx;
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-1 relative"
                  ref={(el) => { stepRefs.current[index] = el; }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ height: `${rowHeightPx}px` }}
                  >
                    <div
                      className={`
                        rounded-full flex items-center justify-center border-2 border-[#d1d5db] transition-all duration-200
                        ${step.cancelled
                          ? "bg-white border-[var(--primary)] border-dashed"
                          : step.completed
                          ? "bg-[var(--primary)] border-[var(--primary)]"
                          : step.active
                          ? "bg-[var(--primary)] border-[var(--primary)] border-dashed"
                          : "bg-[#d1d5db] border-[#d1d5db]"
                        }
                      `}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        minWidth: `${size}px`,
                        minHeight: `${size}px`,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <span className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Estado del proceso</h3>
      </span>
      <div className="flex items-center gap-3">
        {displayIcon != null && (
          <div className="flex-shrink-0 flex items-center justify-center text-gray-500 pt-3 w-[40px] h-[40px] p-[5px] rounded-[50%] bg-[var(--primary)] mr-[10px]" aria-hidden>
            {displayIcon}
          </div>
        )}
        {processSteps.length === 1 ? (
          <div className="flex-1">
            <p
              className={`
                text-sm font-medium
                ${processSteps[0].active || processSteps[0].completed ? "text-[var(--primary)] font-bold" : processSteps[0].cancelled ? "text-[var(--primary)]" : "text-gray-500"}
              `}
            >
              {processSteps[0].label}
            </p>
          </div>
        ) : (
        <div className="flex-1 min-w-0 relative">
        {/* Línea de conexión de fondo */}
        <div 
          className="absolute h-0.5 bg-gray-300"
          style={{ 
            top: "39px",
            left: "4px",
            right: "4px"
          }}
        ></div>
        
        {/* Línea de progreso roja */}
        {progressLineStyle && (
          <div 
            className="absolute h-0.5 bg-[var(--primary)] transition-all duration-500"
            style={{ 
              top: "39px",
              left: progressLineStyle.left,
              width: progressLineStyle.width
            }}
          ></div>
        )}
        
        <div className="flex items-start justify-between relative">
          {processSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1 relative"
              style={{ zIndex: 10 }}
              ref={el => {
                stepRefs.current[index] = el;
              }}
            >
              {/* Circle - tamaño fijo para evitar que se estreche */}
              <div
                className={`
                  w-[16px] h-[16px] rounded-full flex items-center justify-center
                  border-2 border-[#d1d5db] transition-all duration-200
                  relative
                  ${step.cancelled
                    ? "bg-white border-[var(--primary)] border-dashed"
                    : step.completed
                    ? "bg-[var(--primary)] border-[var(--primary)]"
                    : step.active
                    ? "bg-white border-[var(--primary)] border-dashed"
                    : "bg-gray-300 border-gray-300"
                  }
                  ${index < processSteps.length - 1 ? "has-connector" : ""}
                `}
                style={{ flexShrink: 0, minWidth: "16px", minHeight: "16px" }}
              >
                {/* Calcula dinámicamente el width para el conector */}
                {index < processSteps.length - 1 && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      content: "''",
                      top: "50%",
                      left: "100%",
                      height: "2px",
                      width: getConnectorWidth(index),
                      backgroundColor:
                        step.cancelled
                          ? "var(--primary)"
                          : step.completed
                          ? "var(--primary)"
                          : "#d1d5db", // gray-300
                      transition: "background-color 0.5s",
                      transform: "translateY(-50%)",
                      zIndex: 0,
                    }}
                  />
                )}
              </div>

              {/* Label - sin descripción (solo en modo compacto) */}
              <div className="mt-3 text-center w-full px-2">
                <p
                  className={`
                    text-xs font-medium leading-tight m-[5px]
                    ${step.active || step.completed ? "text-[var(--primary)] font-bold" : step.cancelled ? "text-[var(--primary)]" : "text-gray-500"}
                  `}
                >
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
        )}
      </div>
    </div>
  );
}

