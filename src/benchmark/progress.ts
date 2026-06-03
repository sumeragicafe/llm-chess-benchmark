import cliProgress from "cli-progress";
import spinners from "unicode-animations";

export function createProgressBar(total: number): cliProgress.SingleBar {
  const bar = new cliProgress.SingleBar(
    {
      format: " {bar} {percentage}% | {value}/{total} puzzles | Accuracy: {accuracy}% | ETA: {eta}s",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  );
  bar.start(total, 0, { accuracy: "0.0" });
  return bar;
}

export function updateProgress(
  bar: cliProgress.SingleBar,
  completed: number,
  total: number,
): void {
  const correct = bar.getProgress() > 0 ? Math.round(bar.getProgress() * total * (completed / total)) : 0;
  const accuracy = completed > 0 ? ((correct / completed) * 100).toFixed(1) : "0.0";
  bar.update(completed, { accuracy });
}

export function stopProgress(bar: cliProgress.SingleBar, correct: number, total: number): void {
  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";
  bar.update(total, { accuracy });
  bar.stop();
}

export interface Spinner {
  update(msg: string): void;
  stop(msg: string): void;
}

export function createSpinner(initialMsg: string, name: keyof typeof spinners = "scan"): Spinner {
  const { frames, interval } = spinners[name];
  let i = 0;
  let text = initialMsg;
  const timer = setInterval(() => {
    process.stdout.write(`\r\x1B[2K  ${frames[i++ % frames.length]} ${text}`);
  }, interval);

  return {
    update(msg: string) {
      text = msg;
    },
    stop(msg: string) {
      clearInterval(timer);
      process.stdout.write(`\r\x1B[2K  \u25CF ${msg}\n`);
    },
  };
}
