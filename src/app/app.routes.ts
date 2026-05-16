import { Routes } from '@angular/router';
import { Docreader } from 'src/app/components/docreader/docreader';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':id',
        component: Docreader,
      },
    ],
  },
];
