import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ZoomService {
  private _zoom = signal(100);

  zoom = this._zoom.asReadonly();

  increment() {
    if (this.zoom() < 200) {
      this._zoom.update((val) => val + 10);
    }
  }

  decrement() {
    if (this.zoom() > 10) {
      this._zoom.update((val) => val - 10);
    }
  }
}
