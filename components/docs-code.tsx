"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Tab { label: string; code: string }

interface CodeBlockProps {
  tabs?: Tab[];
  code?: string;
  title?: string;
  dark?: boolean;
}

export function CodeBlock({ tabs, code, title, dark = true }: CodeBlockProps) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = tabs ? tabs[active].code : (code ?? "");

  const copy = () => {
    navigator.clipboard.writeText(current).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bg = dark ? "bg-[#160e06]" : "bg-espresso-50";
  const border = dark ? "border-espresso-700/60" : "border-espresso-200";
  const textColor = dark ? "text-amber-50" : "text-espresso-900";
  const labelColor = dark ? "text-espresso-400" : "text-espresso-500";

  return (
    <div className={`overflow-hidden rounded-2xl border ${border} ${bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b ${border} px-4 py-2.5`}>
        <div className="flex items-center gap-1">
          {tabs ? (
            tabs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActive(i)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  active === i
                    ? "bg-espresso-700 text-crema"
                    : `${labelColor} hover:text-espresso-200`
                }`}
              >
                {t.label}
              </button>
            ))
          ) : (
            <span className={`text-xs font-medium ${labelColor}`}>{title}</span>
          )}
        </div>
        <button
          onClick={copy}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition ${labelColor} hover:text-crema`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className={`overflow-x-auto px-5 py-4 text-xs leading-6 ${textColor}`}>
        <code>{current}</code>
      </pre>
    </div>
  );
}
