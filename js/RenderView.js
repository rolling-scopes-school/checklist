import lang from '../lang/lang.json'

export function render(criteria, taskName, information) {
  let isFeedback = false;
  let toClipBoard = '';
  let isCtrl = false;
  let totalTasks = 0;
  let done = 0;
  let langData = lang[getLang()]

  const checkMarks = langData['check-marks'];
  const penaltiesMarks = langData['penalty-marks'];
  const askFeedback = langData['partially-completed-checked'];
  const askChange = langData['changed-assessment'];

  const feedback = document.querySelector('.feedback button');
  feedback.parentElement.classList.remove('hidden');
  const info = document.querySelector('.info');
  const scoreboard = document.querySelector('.score-board');
  scoreboard.parentElement.classList.remove('hidden');
  const doneBoard = document.querySelector('.done');
  const totalTasksBoard = document.querySelector('.total');
  const title = document.querySelector('.title');
  title.innerText = taskName;
  const prepareInfo = document.querySelector('.prepare');
  prepareInfo.innerHTML = information ? information : '';

  const filteredCriteria = criteria.map((item) =>
    (!item['subtitle'] && !item.title) || !item.title ? item : null
  );
  totalTasks = filteredCriteria.filter((el) => el).length;
  totalTasksBoard.innerText = totalTasks;

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) isCtrl = true;
  });
  document.addEventListener('keyup', (e) => {
    if (!e.ctrlKey) isCtrl = false;
  });

  feedback.addEventListener('click', function (e) {
    e.preventDefault();
    getFeedback(filteredCriteria);
  });

  let total = 0;
  let totalWithPercent = 0;
  const percentData = {};
  const renderList = [];
  criteria.forEach((el, i) => {
    el.status === 'main'
      ? renderCriterion(el, i, true)
      : renderCriterion(el, i);
  });
  const domList = document.createElement('form');
  renderList.forEach((el) => domList.appendChild(el));

  const criteriaList = document.querySelector('.criteria-list');
  criteriaList.innerHTML = '';
  criteriaList.appendChild(domList);

  const reset = document.querySelector('.reset');
  reset.addEventListener('click', (e) => {
    total = 0;
    totalWithPercent = 0;
    Object
      .keys(percentData)
      .forEach((key) => delete percentData[key]);
    isFeedback = false;
    filteredCriteria.map((item) => {
      item && delete item.status;
      item && delete item.feedback;
    });
    document.querySelectorAll('.checkbox-container').forEach((el) => {
      el.dataset.active = 'true';
      el.querySelectorAll('input').forEach((input) => (input.checked = false));
      const form = el.querySelector('form');
      form && form.remove();
      el.querySelector('.add-feedback').innerHTML = langData['add-review'];
    });
    checkDone('reset');
    scoreboard.innerHTML = 0;
    reset.classList.add('hidden');
    info.classList.remove('visible');
  });

  // reset state
  reset.click();

  domList.addEventListener('click', (e) => {
    const parent = e.target.parentElement;
    const id = e.target.dataset.id;

    const task = filteredCriteria[id];
    
    if (e.target.tagName === 'INPUT') {
      const radio = e.target;
      const scoreId = radio.dataset.score;
      if (isCtrl && parent.dataset.active == 'true') {
        parent.dataset.active = 'false';
        e.preventDefault();
        return;
      } else if (isCtrl && parent.dataset.active == 'false') {
        parent.dataset.active = 'true';
        e.preventDefault();
        return;
      } else if (!isCtrl && parent.dataset.active != 'false') {
        // Add subtask count
        if (task.status === undefined) checkDone();

        // Calculate actual Total Score
        const isPercentPenalty = task.max[task.max.length - 1] === '%';
        const scores = [0, +(task.max / 2).toFixed(1), task.max];
        if (task.status >= 0 && !isPercentPenalty) {
          total -=
          task.type !== 'penalty'
          ? scores[task.status]
          : scores[task.status] * 2;
        }
        if(!isPercentPenalty) {
          total +=
            task.type !== 'penalty' ? scores[scoreId] : scores[scoreId] * 2;
        } else {
          if (scoreId == 1){
            percentData[task.text] = task.max.slice(0, -1);
          } else {
            delete percentData[task.text];
          }
        }
        const percentSum = Object
          .keys(percentData)
          .reduce((sum, key) => sum - percentData[key], 0);
        totalWithPercent = (total - total * ((percentSum) * 0.01)).toFixed(1);
        task.status = scoreId;

        scoreboard.innerHTML = totalWithPercent < 0 ? 0 : totalWithPercent;

        if (+scoreId === 1 && task.type == 'subtask') {
          task.needFeedback = true;
          task.activeRadio = radio;
          const parent = radio.closest('.checkbox-container');
          if (!parent.querySelector('textarea'))
            parent.querySelector('a').click();
          parent.scrollIntoView({
            behavior: 'smooth',
          });
          askLeaveFeedback(parent, askFeedback);
          document.querySelectorAll('.checkbox-container').forEach((el) => {
            el.dataset.active = 'false';
            if (el === parent) el.dataset.active = 'true';
          });
        } else if (task.needFeedback && task.type == 'subtask') {
          task.needFeedback = false;
          const parent = radio.closest('.checkbox-container');
          const form = parent.querySelector('form');

          // if (filteredCriteria[id].feedback) {
          //   askLeaveFeedback(parent, askChange);
          // } else {
          //   if (form) form.remove();
          // }
          if (form) form.remove();

          document.querySelectorAll('.checkbox-container').forEach((el) => {
            el.dataset.active = 'true';
          });
        }

        if (
          task.activeRadio !== undefined &&
          task.activeRadio.dataset.score !== scoreId &&
          task.feedback
        ) {
          task.activeRadio = radio;
          const parent = radio.closest('.checkbox-container');
          parent.querySelector('a').click();
          askLeaveFeedback(parent, askChange);
        }

        isFeedback && getFeedback(filteredCriteria);
      }

      if (filteredCriteria.some((el) => el && el.status !== undefined))
        reset.classList.remove('hidden');
      else reset.classList.add('hidden');

      task.activeRadio = radio;
    }
  });

  function renderCriterion(el, i, flag) {
    const parentDiv = document.createElement('div');
    if (el.type === 'title') {
      parentDiv.classList.add('title');
      const title = document.createElement('h3');
      title.innerText = el.title;
      parentDiv.appendChild(title);
    } else if (el.type === 'sub-title') {
      parentDiv.classList.add('sub-title');
      const subtitle = document.createElement('h4');
      subtitle.innerText = el.title;
      parentDiv.appendChild(subtitle);
    } else {
      parentDiv.classList.add('checkbox-container');
      parentDiv.dataset.active = 'true';
      parentDiv.dataset.id = i;

      const radioGroup = createRadioGroup(el, i, flag);
      const taskMaxScore = document.createElement('div');
      taskMaxScore.classList.add('task-max-score');
      const scoreDesc =
        el.type == 'penalty'
          ? langData['penalty'] 
          : langData['score'];
      taskMaxScore.innerHTML = `<span>${scoreDesc}</span><p ${(el.max.length > 3) ? 'class="wide-digit"' : ''}>${el.max}</p>`;
      const taskDesc = document.createElement('div');
      taskDesc.classList.add('task-description');
      taskDesc.innerHTML = `<p class='task-title'>${getFormatedText(el.text)}</p>`;
      taskDesc.innerHTML +=
        `<a class='add-feedback' href='#' onclick='addFeedback(event);'>${langData['add-review']}</a>`;

      const overlay = document.createElement('div');
      overlay.classList.add('overlay');
      overlay.onclick = () => {
        const el = document.querySelector('[data-active="true"]');
        askLeaveFeedback(el, askFeedback);
        el.scrollIntoView({
          behavior: 'smooth',
        });
      };

      parentDiv.appendChild(taskMaxScore);
      parentDiv.appendChild(taskDesc);
      parentDiv.appendChild(radioGroup);
      parentDiv.appendChild(overlay);
    }
    renderList.push(parentDiv);
  }

  function askLeaveFeedback(el, message) {
    const textarea = el.querySelector('textarea');
    if (!textarea) return;
    textarea.focus();
    const prevMessage = textarea.parentElement.querySelector('.askFeedback');
    if (prevMessage) prevMessage.remove();
    const askMessage = document.createElement('DIV');
    askMessage.classList.add('askFeedback');
    askMessage.innerHTML = message;
    el.querySelector('.feedback-buttons').appendChild(askMessage);
  }

  function createRadioGroup(el, id, flag) {
    const parent = document.createElement('div');
    parent.classList.add('radio-group');
    const options =
      el.type == 'subtask' ? [...checkMarks] : [...penaltiesMarks];
    options.map((desc, i) => {
      const input = document.createElement('input');
      input.dataset.type = flag ? 'main' : 'regular';
      input.setAttribute('data-id', id);
      input.setAttribute('data-score', i);
      input.setAttribute('name', id);
      input.setAttribute('type', 'radio');
      const span = document.createElement('span');
      span.classList.add('checkmark');

      const label = document.createElement('Label');
      label.innerHTML = desc;
      label.appendChild(input);
      label.appendChild(span);

      parent.appendChild(label);
    });
    return parent;
  }

  function getFeedback(filteredCriteria) {
    info.innerHTML = '';
    const header = document.createElement('div');
    header.classList.add('header');

    const content = document.createElement('div');
    content.classList.add('content');

    const close = document.createElement('p');
    close.classList.add('close');
    close.innerHTML = '&times;';
    close.addEventListener('click', () => {
      info.classList.toggle('visible');
      isFeedback = false;
    });
    header.appendChild(close);
    if (
      filteredCriteria.some(
        (task) => task && task.needFeedback && !task.feedback
      )
    ) {
      const parent = document.querySelector(
        '.checkbox-container[data-active="true"]'
      );
      if (parent.querySelector('textarea')) {
        parent.scrollIntoView({
          behavior: 'smooth',
        });
        askLeaveFeedback(parent, askFeedback);
      }
      content.innerHTML = `<div style="display: flex; height: 100%; justify-content: center; flex-direction: column; text-align: center"><div>${langData['obligatory-feedback']}<em>${langData['partially-completed']}</em>!</div></div>`;
    } else {
      if (totalTasks !== done) {
        content.innerHTML += `<div style="display: flex; height: 100%; justify-content: center; flex-direction: column; text-align: center"><div>${langData['not-all-items']}</div><div>${langData['remaining']}${
          totalTasks - done
        }${langData['out-of']}${totalTasks}${langData['remaining-end']}</div></div>`;
      } else {
        info.innerHTML =
          `<div class="copy"><a href="#" onclick="copyToClipboard(event);">${langData['copy-to-clipboard']}</a></div>`;
        let resultList = filteredCriteria.filter(
          (item) => item && item.status != undefined
        );
        let points = totalWithPercent % 10 > 1 && totalWithPercent % 10 <= 4 
          ? langData['point']
          : langData['points'];
        content.innerHTML += `<p><strong>${langData['your-mark']}${
          totalWithPercent >= 0 ? totalWithPercent : 0
        } ${points}</strong> \r\n</p><p>${langData['review-by-points']}\r\n</p>`;

        const resultDescriptions = {
          0: langData['result-descriptions'][0],
          1: langData['result-descriptions'][1],
          2: langData['result-descriptions'][2],
          penalty: langData['penalties'],
        };
        Object.keys(resultDescriptions).forEach((desc) => {
          let partialResult = [];
          if (
            resultList.some(
              (el) =>
                (el.type == desc && el.status != 0) ||
                (el.type != 'penalty' && el.status == desc)
            )
          ) {
            content.innerHTML += `<p><strong>${resultDescriptions[desc]}\r\n</strong></p>`;
            partialResult = resultList.filter(
              (el) =>
                (el.type == desc && el.status != 0) ||
                (el.type != 'penalty' && el.status == desc)
            );
            partialResult.map((item, i) => {
              content.innerHTML += `<p>${i + 1}) ${item.text} \r\n${
                item.feedback
                  ? `<p style="background:#f1f1f1; font-style: italic; font-size: 11px; padding:5px"><strong>${langData['review']}</strong>` +
                    item.feedback +
                    '</p></p>'
                  : '</p>'
              }\r\n`;
            });
          }
        });
        toClipBoard = content.innerText;
      }
    }

    info.appendChild(header);
    info.appendChild(content);
    info.classList.add('visible');
    isFeedback = true;
  }

  function checkDone(reset) {
    if (!reset) {
      done++;
    } else {
      done = 0;
    }
    doneBoard.innerText = done;
  }

  window.addFeedback = (e) => {
    e.preventDefault();
    document.querySelectorAll('.add-form').forEach((el) => el.remove());
    const link = e.target;
    const id = link.closest('.checkbox-container').querySelector('input')
      .dataset.id;
    const box = document.createElement('form');
    box.classList.add('add-form');
    const textarea = document.createElement('textarea');
    textarea.setAttribute(
      'placeholder',
      langData['use-ctrl-enter']
    );
    if (filteredCriteria[id].feedback) {
      textarea.value = filteredCriteria[id].feedback;
    }
    box.appendChild(textarea);

    const closeText = document.createElement('a');
    closeText.innerText = langData['cancel'];
    closeText.onclick = () => {
      box.remove();
      resetRadioState(id);
    };
    const saveText = closeText.cloneNode();
    saveText.innerText = langData['save'];
    saveText.onclick = () => {
      handleAreaEvent(id, textarea, link, box);
      checkFeedback(id);
    };

    const buttons = document.createElement('DIV');
    buttons.classList.add('feedback-buttons');
    buttons.appendChild(closeText);
    buttons.appendChild(saveText);
    box.appendChild(buttons);
    link.parentElement.appendChild(box);
    textarea.focus();
    textarea.select();
    box.addEventListener('keyup', (e) => {
      if (e.keyCode == 13 && isCtrl) {
        handleAreaEvent(id, textarea, link, box);
        checkFeedback(id);
      } else if (e.keyCode == 27) {
        resetRadioState(id);
        box.remove();
      }
    });
  };

  function checkFeedback(id) {
    if (
      filteredCriteria[id].needFeedback &&
      filteredCriteria[id].feedback &&
      checkString(filteredCriteria[id])
    ) {
      document.querySelectorAll('.checkbox-container').forEach((el) => {
        el.dataset.active = 'true';
      });
    } else if (filteredCriteria[id].needFeedback) {
      const parent = filteredCriteria[id].activeRadio.closest(
        '.checkbox-container'
      );
      parent.querySelector('a').click();
      askLeaveFeedback(
        parent,
        langData['not-empty-feedback']
      );
      setTimeout(() => askLeaveFeedback(parent, askFeedback), 3000);
      return;
    }
  }

  function checkString(taskObj) {
    taskObj.feedback = taskObj.feedback.replace(/(\s+)/g, ' ').trim();
    if (taskObj.feedback.length < 8) return false;
    return true;
  }

  function resetRadioState(id) {
    if (filteredCriteria[id].needFeedback) {
      done--;
      doneBoard.innerText = done;
      filteredCriteria[id].activeRadio.checked = false;
      substractScore(filteredCriteria[id].max);
      delete filteredCriteria[id].needFeedback;
      delete filteredCriteria[id].activeRadio;
      delete filteredCriteria[id].status;
      document.querySelectorAll('.checkbox-container').forEach((el) => {
        el.dataset.active = 'true';
      });
      if (!total) reset.classList.add('hidden');
    }
  }

  function substractScore(score) {
    total -= +(score / 2).toFixed(1);
    scoreboard.innerHTML = total < 0 ? 0 : total;
  }

  function handleAreaEvent(id, textarea, link, box) {
    filteredCriteria[id].feedback = textarea.value;
    if (textarea.value) {
      link.classList.add('feedback-add');
      link.innerHTML = langData['change-review'];
    } else {
      delete filteredCriteria[id].feedback;
      link.classList.remove('feedback-add');
      link.innerHTML = langData['add-review'];
    }
    box.remove();
  }

  window.copyToClipboard = (e) => {
    e.preventDefault();
    e.target.classList.add('not-link');
    e.target.innerText = langData['copied'];
    setTimeout(() => {
      e.target.classList.remove('not-link');
      e.target.innerText = langData['copy-to-clipboard'];
    }, 1000);
    const el = document.createElement('textarea');
    el.value = toClipBoard;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };
}

//chande `some code` to <code>some code</code>
function getFormatedText(text) {
  return text
    .split('`')
    .map((text, i, arr) =>
      (i < (arr.length - 1))
        ? [text, ((i % 2) === 0 ? '<code>' : '</code>')]
        : text
    )
    .flat()
    .join('')
}

export const LANG = 'rs-checklist-lang'
const DEFAULT_LANG = 'ru'

export function getLang () {
  const langRes = localStorage.getItem(LANG);
  return langRes ? langRes : DEFAULT_LANG;
}