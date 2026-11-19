import { useState, useEffect } from "react";
import { useDataCache } from "../context/DataCacheContext";

export default function Data({ 
    label, 
    value, 
    forceInput = false, 
    editable = false, 
    onSave,
    realTimeChange = false,
    inputType = "text",
    placeholder = "",
    required = false,
    checkValidity = () => true,
    showValidation = false,
    options,
    loadOptions,
    optionLabelKey = "label",
    optionValueKey = "value",
    format,
    disabled = false,
}) {
    const [isEditing, setIsEditing] = useState(forceInput);
    const { countries, loadCountries } = useDataCache();

    const createInitialValue = (initialValue) => {
        if (inputType === "phone") {
            const obj = (initialValue && typeof initialValue === "object")
                ? initialValue
                : {};
            // Por defecto usar código de país 54 (Argentina)
            const countryCode = obj.country_code
                ? String(obj.country_code)
                : "54";
            return {
                country_code: countryCode,
                phone: obj.phone ? String(obj.phone) : "",
            };
        }
        if (inputType === "checkbox") {
            return Boolean(initialValue);
        }
        if (inputType === "select" && optionValueKey && initialValue != null && typeof initialValue === "object" && optionValueKey in initialValue) {
            return String(initialValue[optionValueKey]);
        }
        const raw = initialValue || "";
        if (format && typeof format === "function") {
            return format(raw);
        }
        return raw;
    };

    const [editValue, setEditValue] = useState(() => createInitialValue(value));
    const [originalValue, setOriginalValue] = useState(() => createInitialValue(value));
    const [selectOptions, setSelectOptions] = useState(options || []);
    const [error, setError] = useState("");

    // Sincronizar el valor interno cuando cambia la prop `value` o el tipo de input
    useEffect(() => {
        const newVal = createInitialValue(value);
        setEditValue(newVal);
        setOriginalValue(newVal);
    }, [value, inputType]);

    // Cargar opciones para selects si es necesario
    useEffect(() => {
        if (inputType !== "select") return;
        if (options && Array.isArray(options)) {
            setSelectOptions(options);
            return;
        }
        if (!loadOptions) return;

        let cancelled = false;
        Promise.resolve(loadOptions())
            .then((opts) => {
                if (!cancelled && Array.isArray(opts)) {
                    setSelectOptions(opts);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSelectOptions([]);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [inputType, options, loadOptions]);

    // Cargar países para el selector de código telefónico
    useEffect(() => {
        if (!countries && inputType === "phone") {
            loadCountries().catch(() => {});
        }
    }, [countries, loadCountries, inputType]);

    const handleEdit = () => {
        const newVal = createInitialValue(value);
        setEditValue(newVal);
        setOriginalValue(newVal);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditValue(originalValue);
        setIsEditing(false);
    };

    const isEmpty = () => {
        if (inputType === "phone") {
            if (!editValue || typeof editValue !== "object") return true;
            const cc = (editValue.country_code || "").trim();
            const phone = (editValue.phone || "").trim();
            return !cc || !phone;
        }
        if (inputType === "checkbox") {
            return required && !editValue;
        }
        return editValue === "" || editValue === null || editValue === undefined;
    };

    const isValid = (val) => {
        if (inputType === "phone") {
            if (!val || typeof val !== "object") return !required;
            const cc = (val.country_code || "").trim();
            const phoneRaw = (val.phone || "").trim();
            if (required && (!cc || !phoneRaw)) return false;

            const ccOk = /^\d{1,4}$/.test(cc);
            const digitsOnly = phoneRaw.replace(/\D/g, "");
            const phoneOk = /^\d{6,15}$/.test(digitsOnly);

            // Si no es requerido, permitir vacío
            if (!required && !cc && !phoneRaw) return true;

            return ccOk && phoneOk;
        }
        if (inputType === "checkbox") {
            return !required || val === true;
        }
        return checkValidity(val);
    };

    const handleSave = () => {
        const empty = isEmpty();
        const valid = isValid(editValue);

        if ((required && empty) || !valid) {
            console.log("Invalid value: ", editValue);
            setError(inputType === "phone" ? "Teléfono inválido" : "Valor inválido");
            return;
        }
        setError("");
        if (onSave) {
            onSave(editValue);
        }
        setOriginalValue(editValue);
        if (!forceInput) {
            setIsEditing(false);
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    const invalid = (required && isEmpty()) || !isValid(editValue);
    const shouldShowErrorBorder = !disabled && invalid && (showValidation || !!error);

    const getOptionValue = (opt) => {
        if (opt == null) return "";
        let res = "";
        if (typeof opt === "string" || typeof opt === "number") res = String(opt);
        else if (optionValueKey && opt[optionValueKey] !== undefined) res = String(opt[optionValueKey]);
        else if (opt.value !== undefined) res = String(opt.value);
        else if (opt.id !== undefined) res = String(opt.id);
        else if (opt.code !== undefined) res = String(opt.code);
        else res = String(opt);
        return res.trim();
    };

    const getOptionLabel = (opt) => {
        if (opt == null) return "";
        if (typeof opt === "string" || typeof opt === "number") return String(opt);
        if (optionLabelKey && opt[optionLabelKey] !== undefined) return String(opt[optionLabelKey]);
        if (opt.label !== undefined) return String(opt.label);
        if (opt.name !== undefined) return String(opt.name);
        if (opt.description !== undefined) return String(opt.description);
        if (opt.code !== undefined) return String(opt.code);
        return getOptionValue(opt);
    };

    /** Para select: si value es objeto con optionValueKey (ej. { id, name }), usar ese campo como valor del select. */
    const getSelectValue = (val) => {
        if (val == null || val === "") return "";
        let res = "";
        if (inputType !== "select" || !optionValueKey) res = String(val);
        else if (typeof val === "object" && optionValueKey in val && val[optionValueKey] != null) res = String(val[optionValueKey]);
        else res = String(val);
        return res.trim();
    };

    return (
        <div className={`flex ${inputType === "checkbox" ? "flex-row items-center justify-between pt-[10px] pb-[10px]" : "flex-col"} gap-1 m-[5px]`}>
            <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-muted-foreground">
                    <span>{label}</span>
                    {required && (
                        <span className="ml-[2px] text-destructive">*</span>
                    )}
                </label>
                {editable && !isEditing && !forceInput && (
                    <button
                        onClick={handleEdit}
                        className="text-gray-400 hover:text-[var(--primary)] transition-colors"
                        type="button"
                        aria-label="Editar"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                )}
            </div>
            
            {isEditing || forceInput ? (
                <div className="flex gap-2 flex-col">
                    {inputType === "phone" ? (
                        <div className="flex gap-2">
                            <select
                                value={editValue.country_code || "54"}
                                disabled={disabled}
                                onChange={(e) => {
                                    const newVal = {
                                        ...editValue,
                                        country_code: e.target.value,
                                    };
                                    setEditValue(newVal);
                                    setError("");
                                    if (realTimeChange && onSave) {
                                        onSave(newVal);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                className={`select select-bordered w-[70px] mr-[5px] text-base border-[1px] disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed ${shouldShowErrorBorder ? "border-[#ff0000]" : "border-[var(--inputs-border-color)]"}`}
                                autoFocus={!forceInput && !disabled}
                            >
                                {(countries || [])
                                    .filter((c) => c.country_code)
                                    .map((c) => (
                                        <option key={c.id} value={c.country_code}>
                                            {`+${c.country_code}`}
                                        </option>
                                    ))}
                            </select>
                            <input
                                type="tel"
                                value={editValue.phone || ""}
                                disabled={disabled}
                                onChange={(e) => {
                                    const newVal = {
                                        ...editValue,
                                        phone: e.target.value.replace(/[^\d\s-]/g, ""),
                                    };
                                    setEditValue(newVal);
                                    setError("");
                                    if (realTimeChange && onSave) {
                                        onSave(newVal);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                className={`input input-bordered flex-1 text-base border-[1px] disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed ${shouldShowErrorBorder ? "border-[#ff0000]" : "border-[var(--inputs-border-color)]"}`}
                                placeholder={placeholder || label}
                            />
                        </div>
                    ) : inputType === "select" ? (
                        <select
                            value={getSelectValue(editValue)}
                            disabled={disabled}
                            onChange={(e) => {
                                setEditValue(e.target.value);
                                setError("");
                                if (realTimeChange && onSave) {
                                    onSave(e.target.value);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            className={`select select-bordered w-full text-base border-[1px] disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed ${shouldShowErrorBorder ? "border-[#ff0000]" : "border-[var(--inputs-border-color)]"}`}
                        >
                            <option value="">{placeholder || "Seleccionar..."}</option>
                            {selectOptions.map((opt) => {
                                const value = getOptionValue(opt);
                                const labelText = getOptionLabel(opt);
                                return (
                                    <option key={value} value={value}>
                                        {labelText}
                                    </option>
                                );
                            })}
                        </select>
                    ) : inputType === "checkbox" ? (
                        <div>
                            <label className={`flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer group"}`}>
                            <span className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={Boolean(editValue)}
                                    disabled={disabled}
                                    onChange={(e) => {
                                        const newVal = e.target.checked;
                                        setEditValue(newVal);
                                        setError("");
                                        if (realTimeChange && onSave) {
                                            onSave(newVal);
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                    className={`checkbox checkbox-sm rounded border-2 transition-colors appearance-none w-5 h-5 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                                        ${
                                            shouldShowErrorBorder
                                                ? "checkbox-error border-[#ff0000]"
                                                : "border-gray-300 group-hover:border-[var(--primary)] checked:bg-[var(--primary)] checked:border-[var(--primary)]"
                                        }
                                    `}
                                    style={{
                                        WebkitAppearance: "none",
                                        appearance: "none",
                                        outline: "none",
                                    }}
                                />
                                {/* Custom checkmark pseudo-element */}
                                <span
                                    className={`pointer-events-none absolute left-0 top-0 flex items-center justify-center w-5 h-5 rounded-[8px] transition-colors border-2 
                                            ${
                                                editValue
                                                    ? "bg-[var(--primary)] border-[var(--primary)]"
                                                    : shouldShowErrorBorder
                                                    ? "border-[#ff0000]"
                                                    : "border-gray-300"
                                            }
                                            ${
                                                !editValue
                                                    ? "hidden"
                                                    : "block"
                                            }
                                    `}
                                >
                                    {Boolean(editValue) && (
                                        <svg className="w-[20px] h-[20px] text-[#fff]" viewBox="0 0 16 16" fill="none">
                                            <path
                                                d="M4.5 8.5L7 11L11.5 6.5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </span>
                            </span>
                            </label>
                        </div>
                    ) : (
                        <input
                            type={inputType}
                            value={editValue}
                            disabled={disabled}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (format && typeof format === "function") {
                                    val = format(val);
                                }
                                setEditValue(val);
                                setError("");
                                if (realTimeChange && onSave) {
                                    onSave(val);
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            className={`input input-bordered w-full text-base border-[1px] disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed ${shouldShowErrorBorder ? "border-[#ff0000]" : "border-[var(--inputs-border-color)]"}`}
                            placeholder={placeholder || label}
                            autoFocus={!forceInput && !disabled}
                        />
                    )}
                    {error && <p className="text-sm text-[#ff0000] mt-[5px]">{error}</p>}
                    {!forceInput && (
                        <div className="flex gap-1">
                            <button
                                onClick={handleSave}
                                className="btn btn-sm btn-ghost text-green-600 hover:text-green-700"
                                type="button"
                                aria-label="Guardar"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="btn btn-sm btn-ghost text-red-600 hover:text-red-700"
                                type="button"
                                aria-label="Cancelar"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="m-0 text-sm font-medium">
                    {value === null || value === undefined 
                        ? "N/A" 
                        : inputType === "phone" && typeof value === "object"
                            ? `+${value.country_code || ""} ${value.phone || ""}`.trim()
                            : inputType === "checkbox"
                                ? (value ? "Sí" : "No")
                                : typeof value === 'object' 
                                    ? (value.name || value.code || value.id || JSON.stringify(value))
                                    : (format && typeof format === "function" ? format(value) : String(value))}
                </p>
            )}
        </div>
    );
}