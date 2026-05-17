import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { DocumentService } from 'src/app/services/document.service';
import { ZoomService } from 'src/app/services/zoom.service';

export interface Rectangle {
  startX: number;
  startY: number;
  width: number;
  height: number;
  text: string;
}

@Component({
  selector: 'app-doc-image',
  templateUrl: './doc-image.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocImage implements AfterViewInit {
  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private zoomService = inject(ZoomService);

  private isDrawing = false;

  private movingRectangle: Rectangle | null = null;

  private startX = 0;

  private startY = 0;

  private scale = computed(() => this.zoomService.zoom() / 100);

  private documentService = inject(DocumentService);

  private annotationsList = computed(() => {
    return this.documentService.annotationsMap().get(this.image().number) ?? [];
  });

  image = input.required<{ image: HTMLImageElement; number: number }>();

  get canvas() {
    return this.canvasRef().nativeElement;
  }

  get ctx() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No canvas context');
    }
    return ctx;
  }

  constructor() {
    effect(() => {
      this.drawImage();
    });
  }

  onMouseDown(event: MouseEvent) {
    const rect = this.getRekt(event);
    this.startX = event.offsetX;
    this.startY = event.offsetY;
    if (rect) {
      this.documentService.deleteAnnotation(this.image().number, rect);
      this.canvas.style.cursor = 'grabbing';
      this.movingRectangle = rect;
      return;
    }

    const rectToDelete = this.getRektByCloseButton(event);
    if (rectToDelete) {
      this.documentService.deleteAnnotation(this.image().number, rectToDelete);
      this.drawImage();
      return;
    }

    this.isDrawing = true;
  }

  onMouseMove(event: MouseEvent) {
    if (this.movingRectangle) {
      this.clear();
      this.drawImage();
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = 'yellow';
      this.ctx.fillRect(
        this.movingRectangle.startX * this.scale() + event.offsetX - this.startX,
        this.movingRectangle.startY * this.scale() + event.offsetY - this.startY,
        this.movingRectangle.width * this.scale(),
        this.movingRectangle.height * this.scale()
      );
      return;
    }

    const rect = this.getRekt(event);
    if (rect) {
      this.canvas.style.cursor = 'grab';
    } else if (this.getRektByCloseButton(event)) {
      this.canvas.style.cursor = 'pointer';
    } else {
      this.canvas.style.cursor = 'default';
    }

    if (!this.isDrawing) {
      return;
    }
    this.drawRectangle(event);
  }

  onMouseUp(event: MouseEvent) {
    if (this.movingRectangle) {
      this.documentService.addAnnotation(this.image().number, {
        ...this.movingRectangle,
        startX: this.movingRectangle.startX + (event.offsetX - this.startX) / this.scale(),
        startY: this.movingRectangle.startY + (event.offsetY - this.startY) / this.scale(),
      });
      this.movingRectangle = null;
      this.drawImage();
      this.canvas.style.cursor = 'grab';
      return;
    }

    if (!this.isDrawing) {
      return;
    }
    this.isDrawing = false;
    if (this.startX !== event.offsetX && this.startY !== event.offsetY) {
      const text = prompt('Введите текст аннотации');
      if (text !== null) {
        this.documentService.addAnnotation(this.image().number, {
          startX: Math.min(this.startX, event.offsetX) / this.scale(),
          startY: Math.min(this.startY, event.offsetY) / this.scale(),
          width: Math.abs(this.startX - event.offsetX) / this.scale(),
          height: Math.abs(this.startY - event.offsetY) / this.scale(),
          text,
        });
      }
    }
    this.drawImage();
  }

  ngAfterViewInit(): void {
    this.canvas.onmousedown = this.onMouseDown.bind(this);
    this.canvas.onmousemove = this.onMouseMove.bind(this);
    this.canvas.onmouseup = this.onMouseUp.bind(this);
  }

  private clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawRectangle(event: MouseEvent) {
    this.clear();
    this.drawImage();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillRect(this.startX, this.startY, event.offsetX - this.startX, event.offsetY - this.startY);
  }

  private drawSavedRectangles() {
    const scale = this.scale();
    this.annotationsList().forEach(({ startX, startY, width, height, text }) => {
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = 'yellow';
      this.ctx.fillRect(startX * scale, startY * scale, width * scale, height * scale);
      this.ctx.globalAlpha = 1;

      this.ctx.font = `${String(20 * scale)}px Comic Sans MS`;
      this.ctx.fillStyle = 'black';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(text, (startX + width / 2) * scale, (startY + height / 2) * scale);

      this.ctx.beginPath();
      this.ctx.arc((startX - 10) * scale, (startY - 10) * scale, 10 * scale, 0, 2 * Math.PI);
      this.ctx.fill();

      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 3 * this.scale();
      this.ctx.beginPath();
      this.ctx.moveTo((startX - 15) * scale, (startY - 15) * scale);
      this.ctx.lineTo((startX - 5) * scale, (startY - 5) * scale);
      this.ctx.moveTo((startX - 5) * scale, (startY - 15) * scale);
      this.ctx.lineTo((startX - 15) * scale, (startY - 5) * scale);
      this.ctx.stroke();
    });
  }

  private drawImage() {
    const canvas = this.canvas;
    const { image } = this.image();
    const scaledWidth = image.width * this.scale();
    const scaledHeight = image.height * this.scale();
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    this.ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    this.drawSavedRectangles();
  }

  private getRekt({ offsetX, offsetY }: MouseEvent) {
    const scale = this.scale();
    return this.annotationsList().find(
      ({ startX, startY, width, height }) =>
        offsetX >= startX * scale &&
        offsetY >= startY * scale &&
        offsetX <= (startX + width) * scale &&
        offsetY <= (startY + height) * scale
    );
  }

  private getRektByCloseButton({ offsetX, offsetY }: MouseEvent) {
    return this.annotationsList().find(({ startX, startY }) => {
      const centerX = (startX - 10) * this.scale();
      const centerY = (startY - 10) * this.scale();
      return Math.sqrt((offsetX - centerX) ** 2 + (offsetY - centerY) ** 2) < 10 * this.scale();
    });
  }
}
