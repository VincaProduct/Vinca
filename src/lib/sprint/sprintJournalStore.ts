import { Sprint } from "./sprint.types";

const JOURNAL_KEY = "sprint_journal_entries";

type JournalEntry = {
  sprintId: string;
  sprintTitle: string;
  period?: string;
  range?: string;
  quarter?: string;
  answers?: unknown;
  createdAt: string;
  type?: "completion" | "log";
  meta?: Record<string, unknown>;
};

function getWindowSafe(): Window | null {
  if (typeof window === "undefined") return null;
  return window;
}

export function getJournalEntries(): JournalEntry[] {
  const win = getWindowSafe();
  if (!win) return [];
  try {
    const raw = win.localStorage.getItem(JOURNAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JournalEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read sprint journal entries", err);
    return [];
  }
}

function saveJournal(entries: JournalEntry[]): void {
  const win = getWindowSafe();
  if (!win) return;
  try {
    win.localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("Failed to save sprint journal entries", err);
  }
}

export function addJournalEntry(entry: Omit<JournalEntry, "createdAt">): void {
  const entries = getJournalEntries();
  const next: JournalEntry = { ...entry, createdAt: new Date().toISOString(), type: entry.type ?? "log" };
  entries.push(next);
  saveJournal(entries);
}

export function hasSprintCompletionEntry(sprintId: string): boolean {
  return getJournalEntries().some((entry) => entry.sprintId === sprintId && entry.type === "completion");
}

export function createSprintCompletionEntry(params: { sprint: Sprint; phase: number }): void {
  const { sprint, phase } = params;
  addJournalEntry({
    sprintId: sprint.id,
    sprintTitle: sprint.title,
    answers: { phase },
    type: "completion",
  });
}
