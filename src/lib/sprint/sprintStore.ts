import { SprintState } from "./sprint.types";

const STORAGE_KEY = "sprint_state";

const defaultState: SprintState = {
  activeSprintId: null,
  progress: {},
};

function getWindowSafe(): Window | null {
  if (typeof window === "undefined") return null;
  return window;
}

export function getSprintState(): SprintState {
  const win = getWindowSafe();
  if (!win) return { ...defaultState };
  try {
    const raw = win.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw) as SprintState;
    return {
      activeSprintId: parsed.activeSprintId ?? null,
      progress: parsed.progress ?? {},
    };
  } catch (err) {
    console.error("Failed to read sprint state", err);
    return { ...defaultState };
  }
}

export function saveSprintState(state: SprintState): void {
  const win = getWindowSafe();
  if (!win) return;
  try {
    const serialized = JSON.stringify({
      activeSprintId: state.activeSprintId ?? null,
      progress: state.progress ?? {},
    });
    win.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error("Failed to save sprint state", err);
  }
}

export function clearSprintState(): void {
  const win = getWindowSafe();
  if (!win) return;
  try {
    win.localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear sprint state", err);
  }
}
