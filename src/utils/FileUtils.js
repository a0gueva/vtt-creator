// REPLACES: FileUtils.js - Enhanced for export, parsing, and downloading

export function parseVtt(vttText) {
  const lines = vttText.split('\n');
  const cues = [];
  let cue = {};

  for (let line of lines) {
    if (line.includes('-->')) {
      const [start, end] = line.split('-->').map(part => part.trim());
      cue.start = start;
      cue.end = end;
    } else if (line.trim() === '') {
      if (cue.start && cue.end && cue.text) {
        cues.push({ ...cue });
      }
      cue = {};
    } else {
      cue.text = (cue.text || '') + line.trim() + ' ';
    }
  }

  return cues;
}

// export function exportToVtt(cues) {
//   let vttContent = 'WEBVTT\n\n';
//   cues.forEach((cue, index) => {
//     vttContent += `${index + 1}\n${cue.start} --> ${cue.end}\n${cue.text}\n\n`;
//   });
//   return vttContent;
// }

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String((seconds % 60).toFixed(3)).padStart(6, "0");
  return `${h}:${m}:${s}`;
}

export function exportToVtt(cues) {
  let vttContent = 'WEBVTT\n\n';
  cues.forEach((cue, index) => {
    const start = formatTime(cue.startTime || cue.start);
    const end = formatTime(cue.endTime || cue.end);
    const text = typeof cue.text === "string" ? cue.text : JSON.stringify(cue.text);
    vttContent += `${index + 1}\n${start} --> ${end}\n${text}\n\n`;
  });
  return vttContent;
}

export function exportToFile(content, filename, mimeType = 'text/vtt') {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.vtt') ? filename : `${filename}.vtt`;
  link.click();
  URL.revokeObjectURL(link.href);
}
