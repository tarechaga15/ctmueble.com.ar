import Data from "./Data";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";

export default function DataGrid({
    data,
    forceInput = false,
    editable = false,
    onSave,
    inputType = "text",
    required = false,
    checkValidity = (val) => true,
    showValidation = false,
    title,
    icon: Icon,
    canEdit = false,
    onEdit,
    editMode = false,
    onSaveEdit,
    onCancelEdit,
    saveLoading = false,
    columns = 2,
}) {
    const gridColsClass = columns === 3 ? "grid-cols-3" : "grid-cols-2";
    const headerColSpanClass = columns === 3 ? "col-span-3" : "col-span-2";

    const handleSave = (index, newValue) => {
        if (onSave) {
            onSave(index, newValue, data[index]);
        }
    };

    return (
        <div className={`grid ${gridColsClass} gap-[10px] pt-[10px]`}>
            {(title != null || (canEdit && !editMode) || editMode) && (
                <div className={`${headerColSpanClass} flex justify-between items-center gap-[10px] pb-1`}>
                    {title != null ? (
                        <div className="flex items-center gap-2">
                            {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
                            <h2 className="m-0 font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h2>
                        </div>
                    ) : <span />}
                    {editMode ? (
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                size="sm"
                                disabled={saveLoading}
                                onClick={onSaveEdit}
                            >
                                {saveLoading ? (
                                    <span className="loading loading-spinner loading-xs mr-1" />
                                ) : (
                                    <Check className="size-3.5" />
                                )}
                                Guardar
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onCancelEdit}
                                disabled={saveLoading}
                            >
                                <X className="size-3.5" />
                                Cancelar
                            </Button>
                        </div>
                    ) : canEdit && onEdit ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                        >
                            <Pencil className="size-3.5" />
                            Editar
                        </Button>
                    ) : null}
                </div>
            )}
            {data.map((item, index) => (
                <Data
                    key={index}
                    label={item.label}
                    value={item.value}
                    forceInput={item.forceInput !== undefined ? item.forceInput : forceInput}
                    editable={item.editable !== undefined ? item.editable : editable}
                    onSave={item.onSave || (onSave ? (value) => handleSave(index, value) : undefined)}
                    realTimeChange={item.realTimeChange !== undefined ? item.realTimeChange : false}
                    inputType={item.inputType || inputType}
                    placeholder={item.placeholder}
                    required={item.required !== undefined ? item.required : required}
                    checkValidity={item.checkValidity !== undefined ? item.checkValidity : checkValidity}
                    showValidation={item.showValidation !== undefined ? item.showValidation : showValidation}
                    options={item.options}
                    loadOptions={item.loadOptions}
                    optionLabelKey={item.optionLabelKey}
                    optionValueKey={item.optionValueKey}
                    format={item.format}
                    disabled={item.disabled !== undefined ? item.disabled : false}
                />
            ))}
        </div>
    )
}
