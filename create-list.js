const fs = require('fs/promises');
const directoryPath = 'active-tasks';

const createTaskList = async (dir) => {
  const files = await fs.readdir(dir);
  const taskList = { ...files.map((file) => `${dir}/${file}`) };
  fs.writeFile('tasks-to-render.json', JSON.stringify(taskList, null, 2));
};

createTaskList(directoryPath).catch((e) => console.log(`Unable to scan directory\n${e}`));
