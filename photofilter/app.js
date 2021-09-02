class MGEAction {
  actionName = null;
  paramObj = null;
  isCommited = false;

  actionControlsEl = null;

  constructor(paramObj = null) {
    if (paramObj) {
      this.setParamObj(paramObj);
    }
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
  actionName = "Rotate Image";
  renderAction(paramObj, img) {
    let canvas = document.createElement("canvas");

    canvas.width = img.width;
    canvas.height = img.height;

    if (paramObj.expand) {
      canvas.width = Math.sqrt(img.width * img.width + img.height * img.height);
      canvas.height = canvas.width;
    }

    let ctx = canvas.getContext("2d");
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
  actionName = "Filter Blur";
  renderAction(paramObj, img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext("2d");

    ctx.filter = "blur(" + paramObj.length + ")";
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
}
class ActionFilterBrightnessСontrast extends MGEAction {
  actionName = "Filter Brightness/Сontrast";
  renderAction(paramObj, img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext("2d");

    ctx.filter = "brightness(" + paramObj.brightness + ")" + " contrast(" + paramObj.contrast + ")";
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
}

class ActionFilterHueSaturation extends MGEAction {
  actionName = "Filter Hue/Saturation";
  renderAction(paramObj, img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext("2d");

    ctx.filter = "hue-rotate(" + paramObj.huerotate + ")" + " saturate(" + paramObj.saturate + ")";
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
}

class ActionFilterInvert extends MGEAction {
  actionName = "Filter Invert";
  renderAction(paramObj, img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext("2d");

    ctx.filter = "invert(" + paramObj.invert + ")";
    ctx.drawImage(img, 0, 0);
    return canvas;
  }
}

class ActionCropImage extends MGEAction {
  actionName = "Crop Image";
  renderAction(paramObj, img) {
    let canvas = document.createElement("canvas");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    let scrCropX = paramObj.xLeft;
    let srcCropY = paramObj.yTop;

    let srcCropWidth = paramObj.xRight - paramObj.xLeft;
    let srcCropHeight = paramObj.yBottom - paramObj.yTop;

    let destWidth = srcCropWidth;
    let destHeight = srcCropHeight;

    canvas.width = destWidth;
    canvas.height = destHeight;
    let destX = canvas.width / 2 - destWidth / 2;
    let destY = canvas.height / 2 - destHeight / 2;

    canvas.getContext("2d").drawImage(img, scrCropX, srcCropY, srcCropWidth, srcCropHeight, destX, destY, destWidth, destHeight);
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
    return this.actions.map((el) => el.actionName);
  }

  clearActionsHistory() {}
}
class MultifunctionalGraphicEditor {
  actions = ["Rotate Image", "Crop Image", "Filter Blur", "Filter Brightness/Сontrast", "Filter Hue/Saturation", "Filter Invert"];
  node = null;
  canvasEl = null;
  srcImage = null;
  actionsSequence = null;

  resultImgEl = null;

  currentActionControlsEl = null;
  actionsHistoryEl = null;

  constructor() {
    this.actionsSequence = new ActionsSequence();

    this.node = document.createElement("div");
    this.node.classList.add("graphic-editor");

    this.resultImgEl = document.createElement("img");
    this.resultImgEl.classList.add("graphic-editor__rendered-image");

    this.currentActionControlsEl = document.createElement("div");
    this.currentActionControlsEl.classList.add("graphic-editor__current-action-controls");

    this.canvasEl = document.createElement("canvas");

    const canvasFieldContainerEl = document.createElement("div");
    canvasFieldContainerEl.classList.add("graphic-editor__canvas-field-container");

    const canvasFieldEl = document.createElement("div");
    canvasFieldEl.classList.add("graphic-editor__canvas-field");
    canvasFieldEl.appendChild(this.resultImgEl);
    //canvasFieldEl.appendChild(this.canvasEl);

    canvasFieldContainerEl.appendChild(canvasFieldEl);

    const labelImportImage = document.createElement("label");
    labelImportImage.textContent = "Import Image";
    labelImportImage.classList.add("graphic-editor__button");
    labelImportImage.classList.add("graphic-editor__button-import-image-label");

    const btnImportImage = document.createElement("input");
    btnImportImage.classList.add("graphic-editor__button-import-image");
    btnImportImage.type = "file";
    btnImportImage.hidden = true;

    const btnExportImage = document.createElement("button");
    btnExportImage.classList.add("graphic-editor__button");
    btnExportImage.classList.add("graphic-editor__button-export-image");
    btnExportImage.textContent = "Export Image";
    btnExportImage.onclick = () => this.downloadImageInCanvas();

    const btnCancelLastAction = document.createElement("button");
    btnCancelLastAction.classList.add("graphic-editor__button");
    btnCancelLastAction.classList.add("graphic-editor__button-cancel-last-action");
    btnCancelLastAction.textContent = "Cancel Last Action";
    btnCancelLastAction.onclick = () => this.cancelLastAction();

    labelImportImage.appendChild(btnImportImage);

    const fileActionEl = document.createElement("div");
    fileActionEl.classList.add("graphic-editor__file-actions");

    fileActionEl.appendChild(labelImportImage);
    fileActionEl.appendChild(btnExportImage);
    fileActionEl.appendChild(btnCancelLastAction);

    const avalibleActionsEl = document.createElement("div");
    avalibleActionsEl.classList.add("graphic-editor__avalible-actions");

    this.actionsHistoryEl = document.createElement("div");
    this.actionsHistoryEl.classList.add("graphic-editor__actions-history");

    this.actions.forEach((el) => {
      const button = document.createElement("button");
      button.onclick = () => this.selectCurrentAction(el);
      button.textContent = el;
      button.classList.add("graphic-editor__button_select-action");
      button.classList.add("graphic-editor__button");
      avalibleActionsEl.appendChild(button);
    });

    const mainMenuEl = document.createElement("div");
    mainMenuEl.classList.add("graphic-editor__main-menu");
    mainMenuEl.appendChild(fileActionEl);

    btnImportImage.addEventListener("change", (e) => {
      this.srcImage = new Image();
      if (typeof window.FileReader !== "function") {
        console.log("The file API isn't supported on this browser yet.");
        return;
      }
      if (!e.target) {
        console.log("Um, couldn't find the imgfile element.");
      } else if (!e.target.files) {
        console.log("This browser doesn't seem to support the `files` property of file inputs.");
      } else if (!e.target.files[0]) {
        console.log("Please select a file before clicking 'Load'");
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

    let mainBody = document.createElement("div");
    mainBody.classList.add("graphic-editor__main-body");

    let mainBodyImageControls = document.createElement("div");
    mainBodyImageControls.classList.add("image-controls");

    mainBody.appendChild(canvasFieldContainerEl);
    mainBodyImageControls.appendChild(this.actionsHistoryEl);
    mainBodyImageControls.appendChild(avalibleActionsEl);
    mainBodyImageControls.appendChild(this.currentActionControlsEl);
    mainBody.appendChild(mainBodyImageControls);

    this.node.appendChild(mainMenuEl);
    this.node.appendChild(mainBody);

    document.getElementsByTagName("main")[0].appendChild(this.node);
  }

  renderFinalImage() {
    //document.getElementsByTagName('main')[0].appendChild(this.srcImage);
    //console.log(this.actionsSequence.renderResultImage(this.srcImage));
    this.actionsSequence.renderResultImage(this.srcImage).then((result) => this.drawImageInCanvas(result));
  }

  drawImageInCanvas(img) {
    this.canvasEl.width = img.width;
    this.canvasEl.height = img.height;
    let ctx = this.canvasEl.getContext("2d");
    ctx.drawImage(img, 0, 0);

    this.resultImgEl.src = img.src;
  }

  downloadImageInCanvas(filename = "exportedimage.png") {
    if (this.srcImage) {
      let link = document.createElement("a");
      link.download = filename;
      link.href = this.canvasEl.toDataURL();
      link.click();
    }
  }

  renderCurrentActionsHistory() {
    this.actionsHistoryEl.textContent = "";
    let actionsHistoryContainer = document.createElement("div");
    actionsHistoryContainer.classList.add("actions-history-container");

    let actionsHistoryTitle = document.createElement("div");
    actionsHistoryTitle.classList.add("actions-history__title");
    actionsHistoryTitle.textContent = "Actions History";
    this.actionsSequence.getActionNamesArray().forEach((el) => {
      let action = document.createElement("div");
      action.textContent = el;
      action.classList.add("actions-history__action");
      actionsHistoryContainer.appendChild(action);
    });
    this.actionsHistoryEl.appendChild(actionsHistoryTitle);
    this.actionsHistoryEl.appendChild(actionsHistoryContainer);
  }

  cancelLastAction() {
    if (this.actionsSequence.getLastAction()) {
      this.actionsSequence.removeLastAction();
      this.renderFinalImage();
      this.renderCurrentActionsHistory();
    }
  }

  selectCurrentAction(action) {
    if (this.srcImage) {
      if (this.actionsSequence.getLastAction() && !this.actionsSequence.getLastAction().isCommited) {
        this.actionsSequence.removeLastAction();
      }
      this.renderFinalImage();
      this.currentActionControlsEl.innerHTML = "";
      this.renderCurrentActionsHistory();
      this.resultImgEl.parentNode.classList.remove("graphic-editor__canvas-field_rotate");
      switch (action) {
        case "Rotate Image": {
          this.resultImgEl.parentNode.classList.toggle("graphic-editor__canvas-field_rotate");
          const isExpandCheckbox = document.createElement("input");
          isExpandCheckbox.classList.add("graphic-editor__action-checkbox");
          isExpandCheckbox.type = "checkbox";

          const isExpandCheckboxLabel = document.createElement("label");
          isExpandCheckboxLabel.classList.add("graphic-editor__action-checkbox-label");
          isExpandCheckboxLabel.appendChild(isExpandCheckbox);
          const isExpandCheckboxLabelText = document.createElement("span");
          isExpandCheckboxLabelText.textContent = "Expand canvas for avoid corners crop";
          isExpandCheckboxLabel.appendChild(isExpandCheckboxLabelText);

          const inputRotate = document.createElement("input");
          inputRotate.classList.add("graphic-editor__action-input-range");
          inputRotate.type = "range";
          inputRotate.min = "-360";
          inputRotate.max = "360";
          inputRotate.step = 1;
          inputRotate.value = 0;
          inputRotate.onchange = (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Rotate Image" && !lastAction.isCommited) {
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

          const inputRotateLabel = document.createElement("label");
          inputRotateLabel.classList.add("graphic-editor__action-input-range-label");
          const inputRotateLabelText = document.createElement("p");
          inputRotateLabelText.textContent = "Rotate";
          inputRotateLabel.appendChild(inputRotateLabelText);
          inputRotateLabel.appendChild(inputRotate);

          this.currentActionControlsEl.appendChild(inputRotateLabel);
          this.currentActionControlsEl.appendChild(isExpandCheckboxLabel);
          break;
        }
        case "Filter Blur": {
          const inputRange = document.createElement("input");
          inputRange.classList.add("graphic-editor__action-input-range");
          inputRange.type = "range";
          inputRange.min = "0";
          inputRange.max = "30";
          inputRange.step = 0.5;
          inputRange.value = 0;
          inputRange.onchange = (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Filter Blur" && !lastAction.isCommited) {
              lastAction.setParamObj({ length: e.target.value + "px" });
            } else {
              let action = new ActionFilterBlur();
              action.setParamObj({ length: e.target.value + "px" });
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          };

          const inputRangeLabel = document.createElement("label");
          inputRangeLabel.classList.add("graphic-editor__action-input-range-label");
          const inputRangeLabelText = document.createElement("p");
          inputRangeLabelText.textContent = "Blur radius length";
          inputRangeLabel.appendChild(inputRangeLabelText);
          inputRangeLabel.appendChild(inputRange);

          this.currentActionControlsEl.appendChild(inputRangeLabel);
          break;
        }
        case "Filter Brightness/Сontrast": {
          const inputRange = document.createElement("input");
          inputRange.classList.add("graphic-editor__action-input-range");
          inputRange.type = "range";
          inputRange.min = "0";
          inputRange.max = "200";
          inputRange.step = 0.5;
          inputRange.value = 100;
          inputRange.onchange = (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Filter Brightness/Сontrast" && !lastAction.isCommited) {
              lastAction.setParamObj({ brightness: e.target.value + "%", contrast: lastAction.getParamObj().contrast });
            } else {
              let action = new ActionFilterBrightnessСontrast();
              action.setParamObj({ brightness: inputRange.value + "%", contrast: inputRange2.value + "%" });
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          };

          const inputRangeLabel = document.createElement("label");
          inputRangeLabel.classList.add("graphic-editor__action-input-range-label");
          const inputRangeLabelText = document.createElement("p");
          inputRangeLabelText.textContent = "Brightness";
          inputRangeLabel.appendChild(inputRangeLabelText);
          inputRangeLabel.appendChild(inputRange);

          const inputRange2 = document.createElement("input");
          inputRange2.classList.add("graphic-editor__action-input-range");
          inputRange2.type = "range";
          inputRange2.min = "0";
          inputRange2.max = "200";
          inputRange2.step = 0.5;
          inputRange2.value = 100;
          inputRange2.onchange = (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Filter Brightness/Сontrast" && !lastAction.isCommited) {
              lastAction.setParamObj({ brightness: lastAction.getParamObj().brightness, contrast: e.target.value + "%" });
            } else {
              let action = new ActionFilterBrightnessСontrast();
              action.setParamObj({ brightness: inputRange.value + "%", contrast: e.target.value + "%" });
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          };

          const inputRange2Label = document.createElement("label");
          inputRangeLabel.classList.add("graphic-editor__action-input-range-label");
          const inputRange2LabelText = document.createElement("p");
          inputRange2LabelText.textContent = "Сontrast";
          inputRange2Label.appendChild(inputRange2LabelText);
          inputRange2Label.appendChild(inputRange2);

          this.currentActionControlsEl.appendChild(inputRangeLabel);
          this.currentActionControlsEl.appendChild(inputRange2Label);
          break;
        }
        case "Crop Image": {
          const createInputRange = (max, min, value, name, callback) => {
            const inputRange = document.createElement("input");
            inputRange.classList.add("graphic-editor__action-input-range");
            inputRange.type = "range";
            inputRange.min = min;
            inputRange.max = max;
            inputRange.step = 1;
            inputRange.value = value;
            inputRange.onchange = (e) => callback(e);

            const inputRangeLabel = document.createElement("label");
            inputRangeLabel.classList.add("graphic-editor__action-input-range-label");
            const inputRangeLabelText = document.createElement("p");
            inputRangeLabelText.textContent = name;
            inputRangeLabel.appendChild(inputRangeLabelText);
            inputRangeLabel.appendChild(inputRange);
            return inputRangeLabel;
          };

          let iR1 = createInputRange(this.canvasEl.width / 2, 0, 0, "Left", (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Crop Image" && !lastAction.isCommited) {
              lastAction.setParamObj({
                xLeft: e.target.value * 1,
                xRight: lastAction.getParamObj().xRight,
                yTop: lastAction.getParamObj().yTop,
                yBottom: lastAction.getParamObj().yBottom,
              });
              console.log(lastAction);
            } else {
              let action = new ActionCropImage();
              action.setParamObj({ xLeft: e.target.value * 1, xRight: this.canvasEl.width, yTop: 0, yBottom: this.canvasEl.height });
              console.log(action);
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          });
          let iR2 = createInputRange(this.canvasEl.width, this.canvasEl.width / 2, this.canvasEl.width, "Right", (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Crop Image" && !lastAction.isCommited) {
              lastAction.setParamObj({
                xLeft: lastAction.getParamObj().xLeft,
                xRight: e.target.value * 1,
                yTop: lastAction.getParamObj().yTop,
                yBottom: lastAction.getParamObj().yBottom,
              });
            } else {
              let action = new ActionCropImage();
              action.setParamObj({ xLeft: 0, xRight: e.target.value * 1, yTop: 0, yBottom: this.canvasEl.height });
              console.log(action);
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          });
          let iR3 = createInputRange(this.canvasEl.height / 2, 0, 0, "Top", (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Crop Image" && !lastAction.isCommited) {
              lastAction.setParamObj({
                xLeft: lastAction.getParamObj().xLeft,
                xRight: lastAction.getParamObj().xRight,
                yTop: e.target.value * 1,
                yBottom: lastAction.getParamObj().yBottom,
              });
            } else {
              let action = new ActionCropImage();
              action.setParamObj({ xLeft: 0, xRight: this.canvasEl.width, yTop: e.target.value * 1, yBottom: this.canvasEl.height });
              console.log(action);
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          });
          let iR4 = createInputRange(this.canvasEl.height, this.canvasEl.height / 2, this.canvasEl.height, "Bottom", (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Crop Image" && !lastAction.isCommited) {
              lastAction.setParamObj({
                xLeft: lastAction.getParamObj().xLeft,
                xRight: lastAction.getParamObj().xRight,
                yTop: lastAction.getParamObj().yTop,
                yBottom: e.target.value * 1,
              });
            } else {
              let action = new ActionCropImage();
              action.setParamObj({ xLeft: 0, xRight: this.canvasEl.width, yTop: 0, yBottom: e.target.value * 1 });
              console.log(action);
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          });

          this.currentActionControlsEl.appendChild(iR1);
          this.currentActionControlsEl.appendChild(iR2);
          this.currentActionControlsEl.appendChild(iR3);
          this.currentActionControlsEl.appendChild(iR4);
          break;
        }
        case "Filter Hue/Saturation": {
          const createInputRange = (max, min, value, name, callback) => {
            const inputRange = document.createElement("input");
            inputRange.classList.add("graphic-editor__action-input-range");
            inputRange.type = "range";
            inputRange.min = min;
            inputRange.max = max;
            inputRange.step = 1;
            inputRange.value = value;
            inputRange.onchange = (e) => callback(e);

            const inputRangeLabel = document.createElement("label");
            inputRangeLabel.classList.add("graphic-editor__action-input-range-label");
            const inputRangeLabelText = document.createElement("p");
            inputRangeLabelText.textContent = name;
            inputRangeLabel.appendChild(inputRangeLabelText);
            inputRangeLabel.appendChild(inputRange);
            return inputRangeLabel;
          };

          let iR1 = createInputRange(360, 0, 0, "Hue Rotation", (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Filter Hue/Saturation" && !lastAction.isCommited) {
              lastAction.setParamObj({ huerotate: e.target.value + "deg", saturate: lastAction.getParamObj().saturate });
            } else {
              let action = new ActionFilterHueSaturation();
              action.setParamObj({ huerotate: e.target.value + "deg", saturate: 100 + "%" });
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          });
          let iR2 = createInputRange(200, 0, 100, "Saturation", (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Filter Hue/Saturation" && !lastAction.isCommited) {
              lastAction.setParamObj({ huerotate: lastAction.getParamObj().huerotate, saturate: e.target.value + "%" });
            } else {
              let action = new ActionFilterHueSaturation();
              action.setParamObj({ huerotate: "0deg", saturate: e.target.value + "%" });
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          });

          this.currentActionControlsEl.appendChild(iR1);
          this.currentActionControlsEl.appendChild(iR2);
          break;
        }
        case "Filter Invert": {
          const inputRange = document.createElement("input");
          inputRange.classList.add("graphic-editor__action-input-range");
          inputRange.type = "range";
          inputRange.min = 0;
          inputRange.max = 100;
          inputRange.step = 1;
          inputRange.value = 0;
          inputRange.onchange = (e) => {
            let lastAction = this.actionsSequence.getLastAction();
            if (lastAction && lastAction.actionName === "Filter Invert" && !lastAction.isCommited) {
              lastAction.setParamObj({ invert: e.target.value + "%" });
            } else {
              let action = new ActionFilterInvert();
              action.setParamObj({ invert: e.target.value + "%" });
              this.actionsSequence.addAction(action);
            }
            this.renderFinalImage();
          };

          const inputRangeLabel = document.createElement("label");
          inputRangeLabel.classList.add("graphic-editor__action-input-range-label");
          const inputRangeLabelText = document.createElement("p");
          inputRangeLabelText.textContent = "Filter Invert";
          inputRangeLabel.appendChild(inputRangeLabelText);
          inputRangeLabel.appendChild(inputRange);

          this.currentActionControlsEl.appendChild(inputRangeLabel);
          break;
        }
      }

      const buttonCommit = document.createElement("button");
      buttonCommit.classList.add("graphic-editor__button");
      buttonCommit.classList.add("graphic-editor__button_commit-changes");

      buttonCommit.textContent = "Commit changes made in current action";
      buttonCommit.onclick = () => {
        this.actionsSequence.getLastAction().isCommited = true;
        this.currentActionControlsEl.innerHTML = "";
        this.renderCurrentActionsHistory();
      };
      this.currentActionControlsEl.appendChild(buttonCommit);
    }
  }
}

let MGE = new MultifunctionalGraphicEditor();

const addReminder = () => {
  let deadLine = new Date("December 3, 2021 00:00:00");
  let nowDate = Date.now();

  if (nowDate < deadLine) {
    const reminderEl = document.createElement("div");
    reminderEl.classList.add("reminder");

    const reminderContentEl = document.createElement("div");
    reminderContentEl.classList.add("reminder-content");

    const remindertitileEl = document.createElement("div");
    remindertitileEl.classList.add("reminder__title");

    remindertitileEl.innerHTML = "Hello there!<br>Thank you for waiting.";

    const reminderDescriptionEl = document.createElement("div");
    reminderDescriptionEl.classList.add("reminder__description");

    reminderDescriptionEl.innerHTML =
      '<p>First of all: this app dynamically create all content of html for itself. In src file, main tag is empty. In this app I have used canvas, so it\'s more about Graphic Editor other than Photo Filter - after each action, image, witch is rendered in page are changed - try to save it. As in real Graphic Editor, you dont have any already loaded images, <mark>you have to Import Image to start editing process<mark></p><p>Just in fact: in this structure of classes I have "actions history" (class ActionsSequence), actually that means that you have an ability to cancel actions, <strike>save project to file, load previous project</strike>. You can chek out app.js for more info.</p>';
    reminderDescriptionEl.innerHTML +=
      '<p><mark>Available features</mark> that you can use via UI: <mark>Import Image, Export Image, Cancel Last Action, Rotate, Crop, Filter Blur, Filter Brightness/Сontrast, "Filter Hue/Saturation","Filter Invert"</mark> <p/>';
      reminderDescriptionEl.innerHTML +=
      '<p><mark>Unreleased features</mark> that somehow implemented or planned but unready/unavailable: <mark>Save Project, Load Project, Full Actions History, Edit Previous Action , Share Project, Presets, Better Image Cropp ...</mark><p/>';
      //reminderDescriptionEl.innerHTML += "<p>last upd: 13:34 MSK 2.09.2021</p>";
    const buttonClose = document.createElement("button");
    buttonClose.classList.add("reminder__button-close");
    buttonClose.onclick = () => reminderEl.classList.add("visually-hidden");
    buttonClose.textContent = "ok, let me close this reminder and view task";

    reminderDescriptionEl.appendChild(buttonClose);
    reminderContentEl.appendChild(remindertitileEl);
    reminderContentEl.appendChild(reminderDescriptionEl);
    reminderEl.appendChild(reminderContentEl);

    document.body.appendChild(reminderEl);

    console.log("Self-test:");
    console.log("Repeat original project +10 \nAdd additional functionality (required): +5\nAdditional functionality (optional): + >40(???)")

  }
};
addReminder();
