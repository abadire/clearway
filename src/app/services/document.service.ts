import { httpResource } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Rectangle } from 'src/app/components/doc-image/doc-image';

interface Document {
  name: string;
  pages: { number: number; imageUrl: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  docName = signal('');

  docResource = httpResource<Document>(() => (this.docName() ? `docs/${this.docName()}/1.json` : undefined));

  annotationsMap = signal(new Map<number, Rectangle[]>()); // ключ - номер страницы

  addAnnotation(number: number, rect: Rectangle) {
    this.annotationsMap.update((oldMap) => {
      const savedAnnotations = oldMap.get(number);
      if (savedAnnotations) {
        oldMap.set(number, [...savedAnnotations, rect]);
      } else {
        oldMap.set(number, [rect]);
      }
      return new Map(oldMap);
    });
  }

  deleteAnnotation(number: number, rect: Rectangle) {
    this.annotationsMap.update((oldMap) => {
      const savedAnnotations = oldMap.get(number);
      if (savedAnnotations) {
        oldMap.set(
          number,
          savedAnnotations.filter((annotaion) => annotaion !== rect)
        );
      }
      return new Map(oldMap);
    });
  }

  save() {
    console.log('Информация о документе:\n', this.docResource.value());
    console.log('Аннотации:\n', [...this.annotationsMap().entries()]);
  }
}
