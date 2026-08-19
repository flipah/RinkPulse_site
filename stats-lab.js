(() => {
  const form = document.querySelector("#ice-time-form");
  if (!form) return;

  const gameInput = document.querySelector("#game-minutes");
  const linesInput = document.querySelector("#line-count");
  const shiftInput = document.querySelector("#shift-seconds");
  const iceTimeOutput = document.querySelector("#result-ice-time");
  const shiftsOutput = document.querySelector("#result-shifts");
  const restOutput = document.querySelector("#result-rest");
  const ratioOutput = document.querySelector("#result-ratio");
  const shareOutput = document.querySelector("#result-share");
  const copyButton = document.querySelector("#copy-estimate");
  const copyStatus = document.querySelector("#copy-status");

  const clamp = (value, min, max, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  };

  const formatTime = (totalSeconds) => {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const minutesPart = Math.floor(seconds / 60);
    const secondsPart = String(seconds % 60).padStart(2, "0");
    return `${minutesPart}:${secondsPart}`;
  };

  const readValues = () => ({
    gameMinutes: clamp(gameInput.value, 15, 180, 60),
    lines: clamp(linesInput.value, 2, 6, 3),
    shiftSeconds: clamp(shiftInput.value, 20, 180, 45),
  });

  const calculate = () => {
    const values = readValues();
    const gameSeconds = values.gameMinutes * 60;
    const iceSeconds = gameSeconds / values.lines;
    const estimatedShifts = Math.max(1, Math.round(iceSeconds / values.shiftSeconds));
    const restSeconds = values.shiftSeconds * (values.lines - 1);
    const share = Math.round(100 / values.lines);

    iceTimeOutput.textContent = formatTime(iceSeconds);
    shiftsOutput.textContent = String(estimatedShifts);
    restOutput.textContent = formatTime(restSeconds);
    ratioOutput.textContent = `1 : ${values.lines - 1}`;
    shareOutput.textContent = `${share}%`;

    const params = new URLSearchParams({
      game: String(values.gameMinutes),
      lines: String(values.lines),
      shift: String(values.shiftSeconds),
    });
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`);

    return {
      ...values,
      iceTime: formatTime(iceSeconds),
      estimatedShifts,
      restTime: formatTime(restSeconds),
      ratio: `1:${values.lines - 1}`,
    };
  };

  const loadSharedValues = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("game")) gameInput.value = clamp(params.get("game"), 15, 180, 60);
    if (params.has("lines")) linesInput.value = clamp(params.get("lines"), 2, 6, 3);
    if (params.has("shift")) shiftInput.value = clamp(params.get("shift"), 20, 180, 45);
  };

  form.addEventListener("input", () => {
    copyStatus.textContent = "";
    calculate();
  });

  copyButton.addEventListener("click", async () => {
    const result = calculate();
    const summary = `RinkPulse estimate: ${result.gameMinutes}-minute game, ${result.lines} lines, ${result.shiftSeconds}-second shifts = ${result.iceTime} ice time, about ${result.estimatedShifts} shifts, ${result.restTime} rest, ${result.ratio} work/rest. ${window.location.href}`;

    try {
      await navigator.clipboard.writeText(summary);
      copyStatus.textContent = "Estimate copied. Send it to your line.";
    } catch {
      copyStatus.textContent = "Copy was blocked by this browser. Select the page address to share this estimate.";
    }
  });

  loadSharedValues();
  calculate();
})();
