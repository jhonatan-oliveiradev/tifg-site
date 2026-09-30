import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const destination = join(root, ".anidoodle", "repo");
const marker = join(destination, ".tifg-ref");
const repository = "https://github.com/alexgreensh/anidoodle.git";
const ref = process.env.ANIDOODLE_REF ?? "94c171c973caf4ee3b81eb5618c9e5e827db7209";
const engine = join(destination, "skills", "anidoodle", "engine");

const run = (args, options = {}) =>
  execFileSync("git", args, { cwd: root, stdio: "inherit", ...options });

if (existsSync(marker) && existsSync(engine)) {
  const installed = readFileSync(marker, "utf8").trim();
  if (installed === ref) {
    console.log(`AniDoodle ${ref.slice(0, 8)} already installed.`);
    process.exit(0);
  }
}

if (!existsSync(join(destination, ".git"))) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  run(["clone", "--filter=blob:none", "--no-checkout", repository, destination]);
  run(["-C", destination, "sparse-checkout", "init", "--cone"]);
  run(["-C", destination, "sparse-checkout", "set", "skills/anidoodle/engine"]);
}

run(["-C", destination, "fetch", "--depth", "1", "origin", ref]);
run(["-C", destination, "checkout", "--detach", "FETCH_HEAD"]);
run(["-C", destination, "sparse-checkout", "set", "skills/anidoodle/engine"]);
writeFileSync(marker, `${ref}\n`);

console.log(`AniDoodle ${ref.slice(0, 8)} installed at .anidoodle/repo.`);
