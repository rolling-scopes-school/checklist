import {
  render
} from '../js/RenderView.js';
const ghIconUlr = './images/gh.svg'

export class RenderTasks {
  constructor(url) {
    this.url = url;
    this.tasks = [];
    this.fetchFails = [];
  }

  getTask = async taskURL => {
    if (!taskURL.match(/http/)) {}
    let res = await fetch(taskURL);
    if (!res.ok) {
      this.fetchFails.push(taskURL);
      this.renderErrors();
      return;
    };
    let tasksObj = await res.json();
    this.tasks.push(tasksObj);
    const taskContainer = document.createElement('DIV');
    taskContainer.classList.add('taskContainer');
    taskContainer.dataset.name = tasksObj.taskName;
    const taskLink = document.createElement('DIV');
    taskLink.classList.add('taskLink');
    const ghLink = document.createElement('a');
    ghLink.setAttribute('href', tasksObj.github);
    ghLink.setAttribute('target', '_blank');
    const ghImg = document.createElement('img');
    ghImg.classList.add('icon');
    ghImg.src = ghIconUlr;
    ghImg.alt = 'GitHub link'
    ghLink.appendChild(ghImg);
    ghLink.setAttribute('title', 'Original repo README');
    const link = document.createElement('a');
    link.setAttribute('href', (tasksObj.externalLink || taskURL));
    link.innerText = tasksObj.taskName;
    if (!tasksObj.externalLink) link.onclick = (e) => {
      e.preventDefault();
      this.tasksList.remove();
      document.querySelector('.back').classList.remove('hidden');
      render(tasksObj.criteria, tasksObj.taskName, tasksObj.information);
    };
    taskLink.appendChild(link);
    const taskLink2 = taskLink.cloneNode();
    taskLink2.innerHTML = '';
    taskLink2.appendChild(ghLink);
    taskContainer.appendChild(taskLink2);
    taskContainer.appendChild(taskLink);


    this.tasksList && this.tasksList.appendChild(taskContainer);
    this.loader.classList.remove('visible');
  }

  initTasks = async () => {
    this.loader = document.querySelector('.loader');
    this.tasksList = document.querySelector('.tasks-list');
    this.errorsContainer = document.querySelector('.fetch-errors');

    let response = await fetch(this.url);
    if (!response.ok) {
      this.fetchFails.push(this.url.match(/.*\/(?!\/)(.*)$/)[1]);
      this.renderErrors();
      return;
    };
    let filesURL = await response.json();

    const urls = Object.values(filesURL);

    for (let i = 0; i < urls.length; i++) {
      console.log(urls[i])
      await this.getTask(urls[i]);
    }

    // Sort tasks list
    this.tasks = this.tasks.sort((a, b) => {
      return a.taskName > b.taskName ? 1 : -1;
    });
    this.tasks.map(({
      taskName
    }) => {
      const task = this.tasksList.querySelector(`[data-name="${taskName}"]`);
      task && this.tasksList.appendChild(task);
    })
  }

  renderErrors = () => {
    if (this.fetchFails.length) {
      const errDiv = document.createElement('DIV');
      errDiv.classList.add('errMsg');

      this.fetchFails.map(err => {
        errDiv.innerHTML = `Unable to fetch <em>${err}</em>`;
        this.errorsContainer.appendChild(errDiv);
      });
      this.loader.classList.remove('visible');
    }
  }
}