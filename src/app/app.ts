import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { bootstrapDash, bootstrapPlus } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DocumentService } from 'src/app/services/document.service';
import { ZoomService } from 'src/app/services/zoom.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, NgIcon, Button],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [provideIcons({ bootstrapPlus, bootstrapDash })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  documentService = inject(DocumentService);

  zoomService = inject(ZoomService);
}
