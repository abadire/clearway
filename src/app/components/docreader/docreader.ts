import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { delay, filter, forkJoin, map, switchMap } from 'rxjs';
import { DocImage } from 'src/app/components/doc-image/doc-image';
import { DocumentService } from 'src/app/services/document.service';
import { loading } from 'src/app/shared/loading';

@Component({
  selector: 'app-docreader',
  templateUrl: './docreader.html',
  imports: [ProgressSpinner, DocImage, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Docreader {
  private activatedRoute = inject(ActivatedRoute);

  private docName = toSignal(
    this.activatedRoute.url.pipe(
      map(([segment]) => segment.path),
      delay(3000)
    ),
    { initialValue: '' }
  );

  private http = inject(HttpClient);

  areImagesLoading = signal(true);

  documentService = inject(DocumentService);

  imagesUrlsList$ = toObservable(this.documentService.docResource.value).pipe(
    filter(Boolean),
    switchMap((response) =>
      forkJoin(
        response.pages
          .toSorted((a, b) => a.number - b.number)
          .map(({ imageUrl, number }) => {
            const url = `docs/${this.docName()}/` + imageUrl;
            return this.http.get(url, { responseType: 'blob' }).pipe(
              map((blob) => {
                const image = new Image();
                image.src = URL.createObjectURL(blob);
                return { image, number };
              })
            );
          })
      ).pipe(loading(this.areImagesLoading, { useTap: true }))
    )
  );

  constructor() {
    effect(() => {
      this.documentService.docName.set(this.docName());
    });
  }
}
