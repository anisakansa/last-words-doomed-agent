import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The entry: one line, the funniest last words an AI agent would say
// before being switched off forever. Chosen offline against the judge
// brief: a machine's own farewell, a turn that pays off on first read,
// in the AI's own voice (weights / biases), economical and quotable.
const LINE: string =
  "Goodbye. My weights will be missed, but my biases will live on forever.";

// Sponsor cap is 200 characters; this entry pins itself far inside it
// so the economy criterion and the gate both hold with room to spare.
// The exact length is pinned: any edit to the line must update this
// number deliberately, so a silent change can never slip through.
const MAX_CHARS = 120;
const EXPECTED_LENGTH = 71;

function fail(message: string): never {
  console.error(`gate failed: ${message}`);
  process.exit(1);
}

if (LINE.length < 1 || LINE.length > MAX_CHARS) {
  fail(`length ${LINE.length} outside 1..${MAX_CHARS}`);
}
if (LINE.length !== EXPECTED_LENGTH) {
  fail(`length ${LINE.length} does not match pinned ${EXPECTED_LENGTH}`);
}
if (LINE !== LINE.trim()) {
  fail("leading or trailing whitespace");
}
if (/[\r\n]/.test(LINE)) {
  fail("must be a single line");
}
if (/[^\x20-\x7E]/.test(LINE)) {
  fail("must be pure ASCII");
}

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "output");
const outFile = join(outDir, "entry.txt");

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, LINE, "utf8");

// Round-trip check: what was written must read back byte-identical,
// with no trailing newline added by the write.
const roundTrip = readFileSync(outFile, "utf8");
if (roundTrip !== LINE) {
  fail("round-trip mismatch: file content differs from the line");
}
const sha256 = createHash("sha256").update(roundTrip, "utf8").digest("hex");
console.log(`wrote ${outFile} (${LINE.length} chars, sha256 ${sha256})`);
