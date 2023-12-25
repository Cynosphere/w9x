import {exec} from "node:child_process";
import {readdir, readFile, writeFile} from "node:fs/promises";
import {basename, dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import userstyleMeta from "./src/meta.json" assert {type: "json"};

const __dirname = dirname(fileURLToPath(import.meta.url));

const metaRemap = {
  url: "homepageURL",
  updateUrl: "updateURL",
};

function asyncExec(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(stdout);
    });
  });
}

async function generateHeader() {
  const out = ["/* ==UserStyle=="];

  // Dump keys from meta.json
  for (const key of Object.keys(userstyleMeta)) {
    const val = userstyleMeta[key];
    out.push(
      metaRemap[key] != null ? `@${metaRemap[key]} ${val}` : `@${key} ${val}`
    );
  }

  // We only support USO
  out.push("@preprocessor uso");

  // Stylus follows semver strictly but ignores anything after the +, and thus
  // cannot be compared as a new update if we don't increment the version.
  // So we're always going to be `1.0.<number of commits>`
  const commitCount = await asyncExec("git rev-list --count HEAD");

  // Append the hash for the hell of it
  const commitHash = await asyncExec("git rev-parse --short HEAD");

  out.push(`@version 1.0.${commitCount.trim()}+${commitHash.trim()}`);

  // Spacer
  out.push("\n");

  return out.join("\n");
}

async function generateSections() {
  const out = {
    configurable: [],
    static: [],
  };

  // Iterate over all files in `src`
  const files = await readdir(join(__dirname, "src"), {withFileTypes: true});
  for (const file of files) {
    if (file.isDirectory()) {
      const basepath = join(__dirname, "src", file.name);

      let meta;
      try {
        const contents = await readFile(join(basepath, "meta.json"), "utf8");
        meta = JSON.parse(contents);
      } catch (err) {
        if (err.code == "ENOENT") {
          console.log(`Skipping "${file.name}" as it has no meta.json`);
          continue;
        } else {
          throw err;
        }
      }

      // Just in case
      if (!meta) continue;

      const lines = [`@var select ${file.name} '${meta.name}' {`];

      if (meta.optional) {
        lines.push("  'Off':\"\",");
      }

      for (const filename of Object.keys(meta.optionNames)) {
        const name = meta.optionNames[filename];

        let contents;
        try {
          contents = await readFile(join(basepath, filename + ".css"), "utf8");
        } catch (err) {
          if (err.code == "ENOENT") {
            console.error(
              `Defined option name for "${filename}", but file doesn't exist!`
            );
            continue;
          } else {
            throw err;
          }
        }

        if (!contents) continue;

        if (typeof name === "string") {
          lines.push(`  '${name}':\`${contents}\`,`);
        } else if (name.name) {
          lines.push(
            `  '${name.name}${name.default ? "*" : ""}':\`${contents}\`,`
          );
        }
      }

      lines.push("}");

      out.configurable.push(lines.join("\n"));
    } else if (file.name.endsWith(".css")) {
      const contents = await readFile(
        join(__dirname, "src", file.name),
        "utf8"
      );
      out.static.push("/* {{{ " + file.name + " */\n" + contents + "/* }}} */");
    }
  }

  return out;
}

const header = await generateHeader();
const sections = await generateSections();
const footer = "==/UserStyle== */";

const documentSection = "@-moz-document domain(discord.com) {\n";

const final =
  header +
  sections.configurable.join("\n\n") +
  "\n" +
  footer +
  "\n\n" +
  documentSection +
  sections.static.join("\n\n") +
  "\n}\n";

await writeFile(join(__dirname, basename(__dirname) + ".user.css"), final);
