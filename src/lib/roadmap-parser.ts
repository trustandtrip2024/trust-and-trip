import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";

/**
 * Roadmap parser. Reads MD files at repo root, extracts checkbox lines
 * (`- [ ]` / `- [x]`) into a flat task list, and produces a stable hash
 * per task so status persists across doc edits that don't touch the line.
 *
 * Hash strategy: sha256(`${file}::${normalizedText}`) → first 16 hex chars.
 * Re-wording a checkbox is intentionally a new task — old status is left
 * orphaned in the DB, harmless, and a janitor query can prune later.
 */

export type RawTaskStatus = "todo" | "doing" | "blocked" | "done";

export type ParsedTask = {
  hash: string;
  /** Source MD file (e.g. "CONTENT_MEDIA_TODO.md") — relative to repo root. */
  source: string;
  /** Last `## H2` seen above the line, used as the kanban swim-lane. */
  lane: string;
  /** Last `### H3` seen above the line, used as a card subtitle. */
  section: string | null;
  /** Original list text with the `- [ ] ` / `- [x] ` prefix removed. */
  text: string;
  /** Document checkbox state: `[x]` is the doc-author's intent. The kanban
   *  status from `roadmap_tasks` overrides this when present. */
  doneInDoc: boolean;
  /** P1 / P2 / P3 if the line lives under such a heading; else "P3". */
  priority: "P1" | "P2" | "P3";
  /** Line number in the source file (for debugging + clickable jump). */
  line: number;
};

const REPO_ROOT_FILES = [
  "DIRECTOR_AUDIT.md",
  "CONTENT_MEDIA_TODO.md",
  "OPERATOR_HANDBOOK.md",
];

const CHECKBOX_RE = /^[\s-]*\[([ xX])\]\s+(.+?)\s*$/;
const H2_RE = /^##\s+(.+?)\s*$/;
const H3_RE = /^###\s+(.+?)\s*$/;
const PRIORITY_RE = /\b(P1|P2|P3|Priority\s+1|Priority\s+2|Priority\s+3)\b/i;

function hashLine(source: string, text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  return createHash("sha256").update(`${source}::${normalized}`).digest("hex").slice(0, 16);
}

function priorityFor(lane: string): "P1" | "P2" | "P3" {
  const m = lane.match(PRIORITY_RE);
  if (!m) return "P3";
  const v = m[1].toLowerCase();
  if (v === "p1" || v === "priority 1") return "P1";
  if (v === "p2" || v === "priority 2") return "P2";
  return "P3";
}

async function readMd(repoRoot: string, file: string): Promise<string | null> {
  try {
    const full = path.join(repoRoot, file);
    return await fs.readFile(full, "utf8");
  } catch {
    return null;
  }
}

function parseFile(source: string, body: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  let lane = "Uncategorised";
  let section: string | null = null;
  const lines = body.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const h2 = raw.match(H2_RE);
    if (h2) {
      lane = h2[1].trim();
      section = null;
      continue;
    }
    const h3 = raw.match(H3_RE);
    if (h3) {
      section = h3[1].trim();
      continue;
    }
    const cb = raw.match(CHECKBOX_RE);
    if (!cb) continue;

    const doneInDoc = cb[1].toLowerCase() === "x";
    const text = cb[2].replace(/\s+/g, " ").trim();
    if (!text) continue;

    tasks.push({
      hash: hashLine(source, text),
      source,
      lane,
      section,
      text,
      doneInDoc,
      priority: priorityFor(lane),
      line: i + 1,
    });
  }
  return tasks;
}

/**
 * Read every roadmap MD at repo root and return a flat list of parsed
 * tasks. Idempotent — safe to call on every page render. Reads run on the
 * server (Node fs) and are cached by Next at the route level.
 */
export async function parseAllRoadmapTasks(repoRoot: string): Promise<ParsedTask[]> {
  const out: ParsedTask[] = [];
  for (const file of REPO_ROOT_FILES) {
    const body = await readMd(repoRoot, file);
    if (!body) continue;
    out.push(...parseFile(file, body));
  }
  return out;
}

/** Group tasks by source doc → lane for the kanban view. */
export function groupTasks(tasks: ParsedTask[]) {
  const bySource = new Map<string, Map<string, ParsedTask[]>>();
  for (const t of tasks) {
    if (!bySource.has(t.source)) bySource.set(t.source, new Map());
    const lanes = bySource.get(t.source)!;
    if (!lanes.has(t.lane)) lanes.set(t.lane, []);
    lanes.get(t.lane)!.push(t);
  }
  return bySource;
}
