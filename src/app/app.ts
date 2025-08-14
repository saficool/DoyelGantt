import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Gantt, Machine } from './gantt/gantt';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Gantt],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('DoyelGantt');

  machines: Machine[] = [
    {
      id: 'M1',
      name: 'Machine A',
      batches: [
        { id: 'A1', label: 'Batch A1', start: '2025-08-10T06:00:00', end: '2025-08-10T18:00:00', color: '#bfdbfe', successors: ['B2'] },
        { id: 'A2', label: 'Batch A2', start: '2025-08-11T08:00:00', end: '2025-08-12T16:00:00', color: '#93c5fd' }
      ]
    },
    {
      id: 'M2',
      name: 'Machine B',
      batches: [
        { id: 'B1', label: 'Batch B1', start: '2025-08-10T00:00:00', end: '2025-08-10T12:00:00', color: '#a7f3d0' },
        { id: 'B2', label: 'Batch B2', start: '2025-08-10T20:00:00', end: '2025-08-11T10:00:00', color: '#6ee7b7', successors: ['C1'] }
      ]
    },
    {
      id: 'M3',
      name: 'Machine C',
      batches: [
        { id: 'C1', label: 'Batch C1', start: '2025-08-11T12:00:00', end: '2025-08-13T12:00:00', color: '#fcd34d' }
      ]
    }
  ];
  viewStart = new Date('2025-08-10T00:00:00');
  viewEnd = new Date('2025-08-14T00:00:00');

}
