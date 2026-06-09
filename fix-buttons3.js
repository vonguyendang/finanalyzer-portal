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

  // Fix primary button in these forms
  content = content.replace(
    /style="padding:\s*14px 30px;\s*font-size:\s*15px;"/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"'
  );
  content = content.replace(
    /style="padding:\s*14px 30px;\s*font-size:\s*15px;\s*background-color:\s*#e74c3c;\s*color:\s*white;\s*border:\s*none;\s*border-radius:\s*6px;\s*cursor:\s*pointer;\s*font-weight:\s*600;"/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"'
  );
  content = content.replace(
    /style="padding:\s*15px 30px;\s*font-size:\s*15px;"/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"'
  );
  content = content.replace(
    /style="padding:\s*15px 30px;\s*font-size:\s*15px;\s*font-weight:\s*600;\s*background-color:\s*#e74c3c;\s*color:\s*white;\s*border:\s*none;\s*border-radius:\s*6px;\s*cursor:\s*pointer;"/g,
    'style="height: 48px; padding: 0 30px; font-size: 15px; font-weight: 600; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;"'
  );

  fs.writeFileSync(filePath, content);
}
