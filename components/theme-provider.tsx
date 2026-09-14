"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const STORAGE_KEY = "cchat-theme";
const ThemeCtx = createContext<{
  theme: Theme;
  resolved: Resolved;
  setTheme: (t: Theme) => void;
} | null>(null);

function getSystem(): Resolved {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStored(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<Resolved>("light");

  // hydrate from storage + system
  useEffect(() => {
    const stored = getStored();
    setThemeState(stored);
    const sys = getSystem();
    setResolved(stored === "system" ? sys : (stored as Resolved));
  }, []);

  // listen to system changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(m.matches ? "dark" : "light");
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, [theme]);

  // update resolved when theme changes
  useEffect(() => {
    if (theme === "system") {
      setResolved(getSystem());
    } else {
      setResolved(theme);
    }
  }, [theme]);

  // sync html class for early paint + flash prevention
  useEffect(() => {
    const root = document.documentElement;
    const apply = (t: Theme, r: Resolved) => {
      root.classList.remove("dark", "light");
      root.setAttribute("data-cchat-theme", r);
      if (t === "dark") root.classList.add("dark");
      else if (t === "light") root.classList.add("light");
      else {
        // system — reflect resolved on html for CSS fallback
        if (r === "dark") root.classList.add("dark");
      }
    };
    apply(theme, resolved);
  }, [theme, resolved]);

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
    setThemeState(t);
    if (t === "system") setResolved(getSystem());
    else setResolved(t);
    window.dispatchEvent(new CustomEvent("cchat:theme-change", { detail: t }));
  }, []);

  // sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setThemeState(e.newValue as Theme);
        const v = e.newValue as Theme;
        if (v === "system") setResolved(getSystem());
        else setResolved(v as Resolved);
      }
    };
    const onCustom = (e: Event) => {
      const v = (e as CustomEvent).detail as Theme;
      if (v) {
        setThemeState(v);
        if (v === "system") setResolved(getSystem());
        else setResolved(v as Resolved);
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("cchat:theme-change", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cchat:theme-change", onCustom as EventListener);
    }
  }, []);

  const wrapperClass =
    theme === "dark" ? "dark dashboard-theme" : theme === "light" ? "light dashboard-theme" : resolved === "dark" ? "dark dashboard-theme" : "dashboard-theme";

  return (
    <ThemeCtx.Provider value={{ theme, resolved, setTheme }}>
      <div className={wrapperClass}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

// Inline script to prevent flash — call before hydration (add to html)
export function ThemeScript() {
  const script = `
  (function(){
    try{
      var k='cchat-theme';
      var t=localStorage.getItem(k)||'system';
      var sys=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
      var r=t==='system'?sys:t;
      var html=document.documentElement;
      html.classList.remove('dark','light');
      if(t==='dark') html.classList.add('dark');
      else if(t==='light') html.classList.add('light');
      else if(r==='dark') html.classList.add('dark');
      html.setAttribute('data-cchat-theme', r);
      html.setAttribute('data-cchat-theme-pref', t);
    }catch(e){}
  })();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
