class MGEAction {
  actionName = null;
  paramObj = null;
  isCommited = false;

  actionControlsEl = null;

  constructor() {
    //console.log(this.getActionName());
  }

  getActionName() {
    return this.actionName;
  }

  getParamObj() {
    return this.paramObj;
  }

  setParamObj(paramObj) {
    this.paramObj = paramObj;
  }

  getParamsDescription() {}

  renderAction() {
    //here will be impl of render in childs
  }

  getRenderedImage(img) {
    // this.renderAction(this.getParamObj(), canvas);

    // let resultImage = new Image();
    // resultImage.src = this.canvas.toDataURL();

    // return new Promise((resolve, reject) => {
    //   let img = new Image()
    //   img.onload = () => resolve(img.height)
    //   img.onerror = reject
    //   img.src = src
    // })

    return new Promise((resolve, reject) => {
      let canvas = this.renderAction(this.getParamObj(), img);
      let resultImage = new Image();
      resultImage.src = canvas.toDataURL();
      //await img.decode();
      resultImage.onload = () => resolve(resultImage);
      resultImage.onerror = reject;
    });

    // return (async () => {
    //   let canvas = this.renderAction(this.getParamObj(), img);
    //   let resultImage = new Image();
    //   resultImage.src = canvas.toDataURL();
    //   await resultImage.decode();
    //   return resultImage;
    //   //console.log( `width: ${ img.width }, height: ${ img.height }` );
    // })();
    // return resultImage;
  }

  getRenderedImageData() {
    this.renderAction(this.getParamObj());
    return this.canvas.toDataURL();
  }
}

class ActionRotate extends MGEAction {
  actionName = 'rotate';
  renderAction(paramObj, img) {
    let canvas = document.createElement('canvas');

    canvas.width = img.width;
    canvas.height = img.height;

    if (paramObj.expand) {
      canvas.width = Math.sqrt(img.width * img.width + img.height * img.height);
      canvas.height = canvas.width;
    }

    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((paramObj.degrees * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    //ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return canvas;
  }
}

class ActionFilterBlur extends MGEAction {
  actionName = 'FilterBlur';
  renderAction(paramObj, img) {
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext('2d');

    ctx.filter = 'blur(' + paramObj.length + ')';
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
}

class ActionCropImage extends MGEAction {
  actionName = 'CropImage';
  renderAction(paramObj, img) {
    let canvas = document.createElement('canvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;

    let scrCropX = paramObj.x;
    let srcCropY = paramObj.y;
    let srcCropWidth = paramObj.width;
    let srcCropHeight = paramObj.height;

    let destWidth = srcCropWidth;
    let destHeight = srcCropHeight;
    let destX = canvas.width / 2 - destWidth / 2;
    let destY = canvas.height / 2 - destHeight / 2;

    canvas.getContext('2d').drawImage(img, scrCropX, srcCropY, srcCropWidth, srcCropHeight, destX, destY, destWidth, destHeight);
    return canvas;
  }
}
class ActionsSequence {
  actions = [];

  constructor() {}

  renderResultImage(srcImg) {
    let prevEl = null;
    if (this.actions !== null && this.actions.length > 0) {
      prevEl = this.actions[0].getRenderedImage(srcImg);
      if (this.actions.length > 1) {
        for (let i = 1; i < this.actions.length; i++) {
          prevEl = prevEl.then((result) => this.actions[i].getRenderedImage(result));
        }
      }
    } else {
      return new Promise((resolve, reject) => {
        resolve(srcImg);
      });
    }
    return prevEl;
  }

  addAction(action) {
    return this.actions.push(action);
  }

  removeLastAction() {
    return this.actions.splice(this.actions.length - 1);
  }

  getLastAction() {
    return this.actions[this.actions.length - 1];
  }

  getActionNamesArray() {
    return this.actions.map(el => el.actionName);
  }

  clearActionsHistory() {}
}
class MultifunctionalGraphicEditor {
  actions = ['rotate','filterblur','cropimage'];
  node = null;
  canvasEl = null;
  srcImage = null;
  actionsSequence = null;

  resultImgEl = null;

  currentActionControlsEl = null;
  actionsHistoryEl = null;

  constructor() {
    this.actionsSequence = new ActionsSequence();

    this.node = document.createElement('div');
    this.node.classList.add('graphic-editor');

    this.resultImgEl = document.createElement('img');
    this.resultImgEl.classList.add('graphic-editor__rendered-image');

    this.currentActionControlsEl = document.createElement('div');
    this.currentActionControlsEl.classList.add('graphic-editor__current-action-controls');

    this.canvasEl = document.createElement('canvas');

    const canvasFieldEl = document.createElement('div');
    canvasFieldEl.classList.add('graphic-editor__canvas-field');
    canvasFieldEl.appendChild(this.resultImgEl);
    //canvasFieldEl.appendChild(this.canvasEl);

    const btnImportImage = document.createElement('input');
    btnImportImage.classList.add('graphic-editor__button-import-image');
    btnImportImage.type = 'file';
    btnImportImage.textContent = 'Import Image';

    const avalibleActionsEl = document.createElement('div');
    avalibleActionsEl.classList.add('graphic-editor__avalible-actions');

    this.actionsHistoryEl = document.createElement('div');
    this.actionsHistoryEl.classList.add('graphic-editor__actions-history');

    this.actions.forEach((el) => {
      const button = document.createElement('button');
      button.onclick = () => this.selectCurrentAction(el);
      button.textContent = el;
      button.classList.add('graphic-editor__button_select-action');
      button.classList.add('graphic-editor__button');
      avalibleActionsEl.appendChild(button);
    });

    const mainMenuEl = document.createElement('div');
    mainMenuEl.classList.add('graphic-editor__main-menu');
    mainMenuEl.appendChild(btnImportImage);
    mainMenuEl.appendChild(avalibleActionsEl);
    mainMenuEl.appendChild(this.actionsHistoryEl);

    btnImportImage.addEventListener('change', (e) => {
      this.srcImage = new Image();
      if (typeof window.FileReader !== 'function') {
        console.log('The file API isn\'t supported on this browser yet.');
        return;
      }
      if (!e.target) {
        console.log('Um, couldn\'t find the imgfile element.');
      } else if (!e.target.files) {
        console.log('This browser doesn\'t seem to support the `files` property of file inputs.');
      } else if (!e.target.files[0]) {
        console.log('Please select a file before clicking \'Load\'');
      } else {
        let file, fr;
        file = e.target.files[0];
        fr = new FileReader();
        fr.onload = () => {
          this.srcImage.src = fr.result;
          this.srcImage.onload = () => {
            this.renderFinalImage();
          };
        };
        fr.readAsDataURL(file);
      }
    });

    this.node.appendChild(mainMenuEl);
    this.node.appendChild(canvasFieldEl);
    this.node.appendChild(this.currentActionControlsEl);

    document.getElementsByTagName('main')[0].appendChild(this.node);
  }

  renderFinalImage() {
    //document.getElementsByTagName('main')[0].appendChild(this.srcImage);
    //console.log(this.actionsSequence.renderResultImage(this.srcImage));
    this.actionsSequence.renderResultImage(this.srcImage).then((result) => this.drawImageInCanvas(result));
  }

  drawImageInCanvas(img) {
    this.canvasEl.width = img.width;
    this.canvasEl.height = img.height;
    let ctx = this.canvasEl.getContext('2d');
    ctx.drawImage(img, 0, 0);

    this.resultImgEl.src = img.src; 
  }

  renderCurrentActionsHistory() {
    this.actionsHistoryEl.textContent = '';
    this.actionsSequence.getActionNamesArray().forEach(el => this.actionsHistoryEl.textContent += ' > ' + el);
  }

  selectCurrentAction(action) {
    if (this.actionsSequence.getLastAction() && !this.actionsSequence.getLastAction().isCommited) {
      this.actionsSequence.removeLastAction()
    }
    this.renderFinalImage();
    this.currentActionControlsEl.innerHTML = '';
    this.renderCurrentActionsHistory();
    switch (action) {
      case 'rotate': {
        const isExpandCheckbox = document.createElement('input');
        isExpandCheckbox.type = 'checkbox';

        const inputRotate = document.createElement('input');
        inputRotate.classList.add('graphic-editor__input-rotate-image');
        inputRotate.type = 'range';
        inputRotate.min = '-360';
        inputRotate.max = '360';
        inputRotate.step = 1;
        inputRotate.value = 0;
        inputRotate.oninput = (e) => {
          let lastAction = this.actionsSequence.getLastAction();
          if (lastAction && lastAction.actionName === 'rotate' && !lastAction.isCommited ) {
            lastAction.setParamObj({ degrees: e.target.value, expand: isExpandCheckbox.checked });
          } else {
            let rotate = new ActionRotate();
            rotate.setParamObj({ degrees: e.target.value, expand: isExpandCheckbox.checked });
            this.actionsSequence.addAction(rotate);
          }

          // let blur = new ActionFilterBlur();
          // blur.setParamObj({ length: '10px' });

          this.renderFinalImage();
        };
        this.currentActionControlsEl.appendChild(isExpandCheckbox);
        this.currentActionControlsEl.appendChild(inputRotate);
      }
    }
    const buttonCommit = document.createElement('button');
    buttonCommit.classList.add('graphic-editor__button');
    buttonCommit.classList.add('graphic-editor__button_commit-changes');

    buttonCommit.textContent = 'Commit changes made in current action';
    buttonCommit.onclick = () => this.actionsSequence.getLastAction().isCommited = true;
    this.currentActionControlsEl.appendChild(buttonCommit);

  }
}

let MGE = new MultifunctionalGraphicEditor();

const addReminder = () => {
  const reminderEl = document.createElement('div');
  reminderEl.classList.add('reminder');

  const reminderContentEl = document.createElement('div');
  reminderContentEl.classList.add('reminder-content');

  const remindertitileEl = document.createElement('div');
  remindertitileEl.classList.add('reminder__title');

  remindertitileEl.innerHTML = 'Hello there!<br>This task still in progress. I need just a little bit of time... <br> Me in discord: <strong>thirdmadman</strong>';

  const reminderDescriptionEl = document.createElement('div');
  reminderDescriptionEl.classList.add('reminder__description');

  reminderDescriptionEl.innerHTML = '<p>In this app I have used canvas, so it\'s more about Graphic Editor other than Photo Filter - after each action, image, witch is rendered in page are changed - <mark>try to save it</mark>. In example of "photo filter" image actually is no changing, its only css transformations, so if you try to save it, you will not to see any changes.</p><p>Just in fact: in this structure of classes I have "actions history" (class ActionsSequence), actually that means that you will have a ability to cancel actions, save project to file, load previous project. You can chek out app.js for more info.</p><p>I afraid that for now, only features that you can use via UI is <mark>load image</mark> and <mark>rotate image</mark> (chekbox for "crop" and "not crop" rotation)<p/>';
  //reminderDescriptionEl.innerHTML += '<p>Oh, and before you write "task is not done" show me you task, at least that will be honest, right, anonymous friend? If you wrote any your structure of classes or just ?..<p/>';
  reminderDescriptionEl.innerHTML += "<p>last upd: 13:23 MSK 31.08.2021</p>"
  const buttonClose = document.createElement('button');
  buttonClose.classList.add('reminder__button-close');
  buttonClose.onclick = () => reminderEl.classList.add('visually-hidden');
  buttonClose.textContent = 'ok, let me close this reminder and view current status of task';

  reminderDescriptionEl.appendChild(buttonClose);
  reminderContentEl.appendChild(remindertitileEl);
  reminderContentEl.appendChild(reminderDescriptionEl);
  reminderEl.appendChild(reminderContentEl);

  document.body.appendChild(reminderEl);
}
addReminder();