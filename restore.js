const fs = require('fs');
const logPath = '/home/ndahi/.gemini/antigravity/brain/d9ba998e-5f53-4ffd-8aa6-50ec58764a49/.system_generated/logs/overview.txt';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const entry = JSON.parse(line);
    if (entry.content && entry.content.includes("multi_replace_file_content") && entry.content.includes("CategoryDetails.jsx")) {
      const content = entry.content;
      const startIdx = content.indexOf("[diff_block_start]");
      const endIdx = content.indexOf("[diff_block_end]");
      if (startIdx !== -1 && endIdx !== -1) {
        const diffBlock = content.substring(startIdx + 18, endIdx);
        let restoredCode = "";
        const diffLines = diffBlock.split('\n');
        for (const dl of diffLines) {
          if (dl.startsWith('-')) {
            restoredCode += dl.substring(1) + '\n';
          } else if (dl.startsWith(' ') || dl === '') {
            restoredCode += (dl.startsWith(' ') ? dl.substring(1) : dl) + '\n';
          }
        }
        fs.writeFileSync('restored_CategoryDetails.txt', restoredCode);
        console.log("Extracted to restored_CategoryDetails.txt");
        process.exit(0);
      }
    }
  } catch (e) {
    // ignore
  }
}
console.log("Not found");
