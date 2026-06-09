const fs = require('fs');
const path = require('path');

const files = [
  'bhtn/index.html',
  'thaisan/index.html',
  'tncn/index.html',
  'gross-net/index.html',
  'khanangvay/index.html',
  'laivay/index.html',
  'tietkiem/index.html'
];

for (const file of files) {
  const filePath = path.join('/Volumes/MacintoshHD-Data/DATA/code/finanalyzer-portal', file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to replace the WHOLE button tag for LÀM MỚI to have standard outline styling
  content = content.replace(
    /<button class="btn-secondary"[^>]+L[Àa]M M[Ớo]I<\/button>/gi,
    '<button type="button" class="btn-secondary" style="height: 48px; padding: 0 30px; font-size: 15px; font-weight: 600; font-family: var(--sans, \'Inter\', sans-serif); border-radius: 6px; border: 2px solid var(--border2, #374151); background: transparent; color: var(--text); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; transition: all 0.2s;" onclick="clearData()" onmouseover="this.style.borderColor=\'var(--blue, #3b82f6)\'; this.style.color=\'var(--blue, #3b82f6)\'" onmouseout="this.style.borderColor=\'var(--border2, #374151)\'; this.style.color=\'var(--text)\'">LÀM MỚI</button>'
  );

  // Fix primary button in these forms
  content = content.replace(
    /style="padding: 14px 30px; font-size: 15px;"([^>]*TÍNH)/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"$1'
  );
  content = content.replace(
    /style="padding: 14px 30px; font-size: 15px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"([^>]*TÍNH)/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"$1'
  );
  content = content.replace(
    /style="padding: 15px 30px; font-size: 15px;"([^>]*TÍNH)/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"$1'
  );
  content = content.replace(
    /style="padding: 15px 30px; font-size: 15px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"([^>]*TÍNH)/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"$1'
  );

  fs.writeFileSync(filePath, content);
}
