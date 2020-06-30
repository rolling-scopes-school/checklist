const fs = require('fs');
const directoryPath = 'active-tasks';
fs.readdir(directoryPath, function (err, files) {
  const data = [];
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach(function (file) {
    data.push(directoryPath + '/' + file);
  });
  fs.writeFileSync("tasks-to-render.json", JSON.stringify({
    ...data
  }));
});