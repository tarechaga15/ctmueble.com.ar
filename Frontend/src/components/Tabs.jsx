import { isValidElement } from "react";
import { cn } from "@/lib/utils";

function TabIcon({ icon }) {
  if (!icon) return null;
  if (isValidElement(icon)) {
    return <span className="inline-flex size-4 items-center justify-center [&_svg]:size-4">{icon}</span>;
  }
  if (typeof icon === "function" || (typeof icon === "object" && typeof icon.render === "function")) {
    const Icon = icon;
    return <Icon className="size-4" />;
  }
  return null;
}

export default function Tabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="no-scrollbar inline-flex h-10 max-w-full items-center gap-0.5 overflow-x-auto rounded-xl bg-muted/80 p-1 text-muted-foreground">
      {tabs.map((tab, index) => {
        const active = activeTab === index;
        return (
          <button
            key={tab.id ?? index}
            type="button"
            onClick={() => setActiveTab(index)}
            className={cn(
              "inline-flex h-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
              "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:opacity-70",
              active
                ? "bg-background text-foreground shadow-sm dark:border dark:border-input dark:bg-input/30 [&_svg]:opacity-100"
                : "text-foreground/60 hover:text-foreground",
            )}
          >
            <TabIcon icon={tab.icon} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
