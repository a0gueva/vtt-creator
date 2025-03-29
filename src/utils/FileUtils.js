// REPLACES: FileUtils.js - Enhanced for export and parsing with validation
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

export function exportToVtt(cues) {
  let vttContent = 'WEBVTT\n\n';
  cues.forEach((cue, index) => {
    vttContent += `${index + 1}\n${cue.start} --> ${cue.end}\n${cue.text}\n\n`;
  });
  return vttContent;
}
