import { compareResults } from "../report/compare.js";

export async function compareCommand(files: string[]) {
  if (files.length < 2) {
    console.error("Error: At least 2 result files are required for comparison");
    process.exit(1);
  }
  compareResults(files);
}
