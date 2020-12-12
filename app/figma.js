import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_MODE,
  modes,
} from './constants.js';
import { handleCursorType } from './utils.js';

class Figma {
  constructor(canvas, config = {}) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.toolboxClassName = config.toolboxClassName || 'toolbox';
    this._mode = DEFAULT_MODE;
    this.fontSize = 24;
    this.fontFamily = 'cursive';

    this.isMouseDown = false;
    this.isWriting = false;
    this.x = 0;
    this.y = 0;

    this.setupToolbox();
    this.setupCanvas();
    this.createGrid();
    this.initListeners();
  }

  get mode() {
    return this._mode;
  }

  set mode(value) {
    if (value != this._mode) {
      this._mode = value;
      this.changeMode(value);
    }
  }

  createGrid() {
    const step = 50;
    const gridGap = 50;

    const width = this.canvas.width;
    const height = this.canvas.height;

    this.context.save();
    this.context.strokeStyle = 'gray';
    this.context.fillStyle = 'black';

    for (let x = 0; x < width; x += step) {
      this.context.fillText(x, x, 10);
    }

    for (let x = 0; x < width; x += gridGap) {
      this.context.beginPath();
      this.context.lineWidth = 0.2;
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height);
      this.context.stroke();
    }

    for (let y = 0; y < height; y += step) {
      this.context.fillText(y, 10, y);
    }

    for (let y = 0; y < height; y += gridGap) {
      this.context.beginPath();
      this.context.lineWidth = 0.2;
      this.context.moveTo(0, y);
      this.context.lineTo(width, y);
      this.context.stroke();
    }

    this.context.restore();
  }

  get toolboxItems() {
    return Array.from(this.toolbox.querySelectorAll('button'));
  }

  get font() {
    return `${this.fontSize}px ${this.fontFamily}`;
  }

  setupToolbox() {
    this.toolbox = document.getElementsByClassName(this.toolboxClassName)[0];
    this.toolboxItems.forEach((toolboxItem) => {
      toolboxItem.addEventListener('click', (event) => {
        this.handleToolBoxItemClick(event, toolboxItem);
      });
    });
    this.changeMode(DEFAULT_MODE);
  }

  handleToolBoxItemClick = (event, toolboxItem) => {
    let mode = toolboxItem.getAttribute('data-mode');
    this.changeMode(mode);
  };

  changeMode = (mode) => {
    this.mode = mode;
    this.toolboxItems.forEach((button) => {
      button.classList.remove('active');
      let _mode = button.getAttribute('data-mode');
      if (mode == _mode) {
        button.classList.add('active');
      }
    });

    handleCursorType(mode);
  };

  setupCanvas() {
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.context.lineWidth = 5;
    this.context.lineCap = 'round';
    this.context.imageSmoothingEnabled = true;
  }

  stopDrawing = () => {
    this.isMouseDown = false;
  };

  startDrawing = (event) => {
    this.isMouseDown = true;

    this.x = event.offsetX;
    this.y = event.offsetY;
  };

  drawRectangle = (event) => {
    if (this.isMouseDown) {
      const width = event.offsetX - this.x;
      const height = event.offsetY - this.y;

      this.context.beginPath();
      this.context.rect(this.x, this.y, width, height);
      this.context.stroke();

      this.stopDrawing();
    }
  };

  drawCircle = (event) => {
    if (this.isMouseDown) {
      const width = event.offsetX - this.x;
      const surr = width / 2;

      this.context.beginPath();
      this.context.arc(
        this.x + surr,
        this.y + surr,
        surr,
        0,
        2 * Math.PI,
        false
      );
      this.context.stroke();

      this.stopDrawing();
    }
  };

  drawLine = (event) => {
    if (this.isMouseDown) {
      const newX = event.offsetX;
      const newY = event.offsetY;
      this.context.beginPath();
      this.context.moveTo(this.x, this.y);
      this.context.lineTo(newX, newY);
      this.context.stroke();

      this.x = newX;
      this.y = newY;
    }
  };

  // write
  writeOnCanvas(event) {
    this.isWriting = true;
    const textarea = document.createElement('textarea');
    textarea.classList.add('tool--text');
    textarea.style.font = this.font;
    textarea.style.left = `${event.offsetX}px`;
    textarea.style.top = `${event.offsetY}px`;
    document.body.appendChild(textarea);

    textarea.focus();

    textarea.addEventListener('focusout', () => {
      const value = textarea.value;
      this.context.font = this.font;
      this.context.fillText(
        value,
        event.offsetX,
        event.offsetY + this.fontSize + 3
      );

      document.body.removeChild(textarea);
      this.isWriting = false;
    });
  }

  initListeners() {
    const { canvas } = this;

    canvas.addEventListener('mousedown', (event) => {
      switch (this.mode) {
        case modes.draw:
          this.startDrawing(event);
          break;

        case modes.text:
          break;

        case modes.rectangle:
          this.startDrawing(event);
          break;

        case modes.circle:
          this.startDrawing(event);
          break;
      }
    });

    canvas.addEventListener('mousemove', (event) => {
      switch (this.mode) {
        case modes.draw:
          this.drawLine(event);
          break;

        case modes.text:
          break;

        case modes.rectangle:
          // this.drawRectangle(event);
          break;
      }
    });

    canvas.addEventListener('mouseup', (event) => {
      switch (this.mode) {
        case modes.draw:
          this.stopDrawing(event);
          break;

        case modes.text:
          break;

        case modes.rectangle:
          this.drawRectangle(event);
          break;

        case modes.circle:
          this.drawCircle(event);
          break;
      }
    });

    canvas.addEventListener('mouseout', (event) => {
      switch (this.mode) {
        case modes.draw:
          this.stopDrawing(event);
          break;

        case modes.text:
          break;
      }
    });

    canvas.addEventListener('click', (event) => {
      switch (this.mode) {
        case modes.draw:
          break;

        case modes.text:
          if (!this.isWriting) {
            this.writeOnCanvas(event);
          }
          break;
      }
    });
  }
}

const figma = (window.figma = new Figma(document.getElementById('app')));
