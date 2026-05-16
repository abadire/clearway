import { WritableSignal } from '@angular/core';
import { defer, Observable, Subject } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

function prepare<T>(callback: () => void): (source$: Observable<T>) => Observable<T> {
  return (source$: Observable<T>): Observable<T> =>
    defer(() => {
      callback();
      return source$;
    });
}

export function loading<T>(
  indicator: Subject<boolean> | WritableSignal<boolean>,
  params?: { useTap: boolean } // whether it should disable indicator on complete (default) or on emission
): (source$: Observable<T>) => Observable<T> {
  const method = ('next' in indicator ? indicator.next : indicator.set).bind(indicator);
  return (source$: Observable<T>): Observable<T> =>
    source$.pipe(
      prepare(() => {
        method(true);
      }),
      tap(() => {
        params?.useTap && method(false);
      }),
      finalize(() => {
        method(false);
      })
    );
}
