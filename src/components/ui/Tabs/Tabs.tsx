import type { ReactNode } from "react";
import "./Tabs.css";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  children?: ReactNode;
}

export const Tabs = <T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
  children,
}: TabsProps<T>) => {
  return (
    <div className={`tabs-container ${className}`}>
      <div className="tabs-header" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`tab-button ${isActive ? "active" : ""}`}
              onClick={() => onChange(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {children && <div className="tab-content">{children}</div>}
    </div>
  );
};
