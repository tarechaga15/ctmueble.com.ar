import { createContext, useContext, useState, useCallback } from "react";

const EssayDraftContext = createContext(null);

const initialDraft = {
  step: 0,
  data: {
    essay: {
      type: "",
      typeName: "",
      template: "",
      templateLabel: "",
      date: "",
      batch_number: "",
      observations: "",
    },
    client: null,
  },
};

export function EssayDraftProvider({ children }) {
  const [draft, setDraftState] = useState(initialDraft);

  const setDraft = useCallback((updater) => {
    setDraftState((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  }, []);

  const resetDraft = useCallback(() => {
    setDraftState(initialDraft);
  }, []);

  return (
    <EssayDraftContext.Provider value={{ draft, setDraft, resetDraft }}>
      {children}
    </EssayDraftContext.Provider>
  );
}

export function useEssayDraft() {
  const ctx = useContext(EssayDraftContext);
  if (!ctx) {
    throw new Error("useEssayDraft must be used within an EssayDraftProvider");
  }
  return ctx;
}

