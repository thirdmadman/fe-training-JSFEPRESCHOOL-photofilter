class MultifunctionalGraphicEditor {
  node = null;
  canvasEl = null;

  srcImage = null;

  constructor() {
    this.node = document.createElement("div");
    this.node.classList.add("graphic-editor");

    this.canvasEl = document.createElement("canvas");

    const btnImportImage = document.createElement("input");
    btnImportImage.classList.add("graphic-editor__button-import-image");
    btnImportImage.type = "file";
    btnImportImage.textContent = "Import Image";

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
          this.srcImage.onload = (el) => {
            this.drawImageInConvas(el.target);
          };
        };
        fr.readAsDataURL(file);
      }
    });

    const btnRotateRight = document.createElement("button");
    btnRotateRight.classList.add("graphic-editor__button-rotate-image");
    btnRotateRight.textContent = "Rotate right";

    btnRotateRight.addEventListener("click", () => {
      this.drawRotated(+1);
    });

    const btnRotateLeft = document.createElement("button");
    btnRotateLeft.classList.add("graphic-editor__button-rotate-image");
    btnRotateLeft.textContent = "Rotate Left";

    btnRotateLeft.addEventListener("click", () => {
      this.drawRotated(-1);
    });

    this.node.appendChild(btnImportImage);
    this.node.appendChild(this.canvasEl);
    this.node.appendChild(btnRotateRight);
    this.node.appendChild(btnRotateLeft);

    document.getElementsByTagName("main")[0].appendChild(this.node);
  }

  drawImageInConvas(img) {
    this.canvasEl.width = img.width;
    this.canvasEl.height = img.height;
    let ctx = this.canvasEl.getContext("2d");
    ctx.drawImage(img, 0, 0);
  }

  drawRotated(degrees) {
    let ctx = this.canvasEl.getContext("2d");
    ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    //ctx.save();
    ctx.translate(this.canvasEl.width / 2, this.canvasEl.height / 2);
    ctx.rotate((degrees * Math.PI) / 180);
    ctx.drawImage(this.srcImage, -this.srcImage.width / 2, -this.srcImage.height / 2);
    //ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    //this.srcImage.src = this.canvasEl.toDataURL();
  }
}

let MGE = new MultifunctionalGraphicEditor();


// function drawRotated(degrees) {
//   let ctx = canvas.getContext("2d");
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   //ctx.save();
//   ctx.translate(canvas.width / 2, canvas.height / 2);
//   ctx.rotate((degrees * Math.PI) / 180);
//   ctx.drawImage(srcImage, -srcImage.width / 2, -srcImage.height / 2);
//   //ctx.restore();
//   ctx.setTransform(1, 0, 0, 1, 0, 0);
//   srcImage.src = canvas.toDataURL();
// }

// function cropImage(x, y, width, height) {
//   canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
//   canvas.width = width;
//   canvas.height = height;

//   let scrCropX = x;
//   let srcCropY = y;
//   let srcCropWidth = width;
//   let srcCropHeight = height;

//   let destWidth = srcCropWidth;
//   let destHeight = srcCropHeight;
//   let destX = canvas.width / 2 - destWidth / 2;
//   let destY = canvas.height / 2 - destHeight / 2;

//   canvas.getContext("2d").drawImage(srcImage, scrCropX, srcCropY, srcCropWidth, srcCropHeight, destX, destY, destWidth, destHeight);
//   srcImage.src = canvas.toDataURL();
// }

// function imagedata_to_image(imagedata) {
//   let canvas2 = document.createElement("canvas");
//   let ctx2 = canvas2.getContext("2d");
//   canvas2.width = imagedata.width;
//   canvas2.height = imagedata.height;
//   ctx2.putImageData(imagedata, 0, 0);

//   let image2 = new Image();
//   image2.src = canvas2.toDataURL();
//   return image2;
// }
