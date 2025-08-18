import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Gantt, Resource } from './gantt/gantt';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Gantt],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('DoyelGantt');


  resources: Resource[] = [
    {
      id: 'M1',
      name: 'Machine A',
      tasks: [
        { id: 'A1', label: 'Task A1', start: '2025-08-10T06:00:00', end: '2025-08-10T13:00:00', color: '#bfdbfe', successors: ['B2'] },
        { id: 'A2', label: 'Task A2', start: '2025-08-10T14:00:00', end: '2025-08-10T22:00:00', color: '#93c5fd' },
        { id: 'A3', label: 'Task A3', start: '2025-08-11T08:00:00', end: '2025-08-11T16:00:00', color: '#60a5fa' }
      ]
    },
    {
      id: 'M2',
      name: 'Machine B',
      tasks: [
        { id: 'B1', label: 'Task B1', start: '2025-08-10T00:00:00', end: '2025-08-10T08:00:00', color: '#a7f3d0' },
        { id: 'B2', label: 'Task B2', start: '2025-08-10T14:00:00', end: '2025-08-11T06:00:00', color: '#6ee7b7', successors: ['C2'] },
        { id: 'B3', label: 'Task B3', start: '2025-08-11T07:00:00', end: '2025-08-11T18:00:00', color: '#34d399' }
      ]
    },
    {
      id: 'M3',
      name: 'Machine C',
      tasks: [
        { id: 'C1', label: 'Task C1', start: '2025-08-10T09:00:00', end: '2025-08-10T17:00:00', color: '#fcd34d' },
        { id: 'C2', label: 'Task C2', start: '2025-08-11T07:00:00', end: '2025-08-12T15:00:00', color: '#fbbf24', successors: ['D1'] }
      ]
    },
    {
      id: 'M4',
      name: 'Machine D',
      tasks: [
        { id: 'D1', label: 'Task D1', start: '2025-08-12T16:00:00', end: '2025-08-13T08:00:00', color: '#f9a8d4', successors: ['E2'] },
        { id: 'D2', label: 'Task D2', start: '2025-08-13T09:00:00', end: '2025-08-13T18:00:00', color: '#f472b6' },
        { id: 'D3', label: 'Task D3', start: '2025-08-13T19:00:00', end: '2025-08-14T05:00:00', color: '#ec4899' }
      ]
    },
    {
      id: 'M5',
      name: 'Machine E',
      tasks: [
        { id: 'E1', label: 'Task E1', start: '2025-08-10T10:00:00', end: '2025-08-10T18:00:00', color: '#c084fc' },
        { id: 'E2', label: 'Task E2', start: '2025-08-13T09:00:00', end: '2025-08-13T21:00:00', color: '#a855f7', successors: ['F3'] },
        { id: 'E3', label: 'Task E3', start: '2025-08-14T06:00:00', end: '2025-08-14T14:00:00', color: '#9333ea' }
      ]
    },
    {
      id: 'M6',
      name: 'Machine F',
      tasks: [
        { id: 'F1', label: 'Task F1', start: '2025-08-10T05:00:00', end: '2025-08-10T11:00:00', color: '#fb7185' },
        { id: 'F2', label: 'Task F2', start: '2025-08-10T12:00:00', end: '2025-08-10T20:00:00', color: '#f43f5e' },
        { id: 'F3', label: 'Task F3', start: '2025-08-13T22:00:00', end: '2025-08-14T10:00:00', color: '#ef4444', successors: ['G3'] }
      ]
    },
    {
      id: 'M7',
      name: 'Machine G',
      tasks: [
        { id: 'G1', label: 'Task G1', start: '2025-08-10T07:00:00', end: '2025-08-10T15:00:00', color: '#facc15' },
        { id: 'G2', label: 'Task G2', start: '2025-08-10T16:00:00', end: '2025-08-11T04:00:00', color: '#eab308', successors: ['H1'] },
        { id: 'G3', label: 'Task G3', start: '2025-08-14T11:00:00', end: '2025-08-14T19:00:00', color: '#ca8a04' }
      ]
    },
    {
      id: 'M8',
      name: 'Machine H',
      tasks: [
        { id: 'H1', label: 'Task H1', start: '2025-08-11T05:00:00', end: '2025-08-11T13:00:00', color: '#84cc16', successors: ['I2'] },
        { id: 'H2', label: 'Task H2', start: '2025-08-11T14:00:00', end: '2025-08-12T02:00:00', color: '#65a30d' },
        { id: 'H3', label: 'Task H3', start: '2025-08-12T03:00:00', end: '2025-08-12T12:00:00', color: '#16a34a' }
      ]
    },
    {
      id: 'M9',
      name: 'Machine I',
      tasks: [
        { id: 'I1', label: 'Task I1', start: '2025-08-10T13:00:00', end: '2025-08-10T21:00:00', color: '#06b6d4' },
        { id: 'I2', label: 'Task I2', start: '2025-08-11T14:00:00', end: '2025-08-12T06:00:00', color: '#0891b2', successors: ['J3'] },
        { id: 'I3', label: 'Task I3', start: '2025-08-12T07:00:00', end: '2025-08-12T16:00:00', color: '#0e7490' }
      ]
    },
    {
      id: 'M10',
      name: 'Machine J',
      tasks: [
        { id: 'J1', label: 'Task J1', start: '2025-08-10T08:00:00', end: '2025-08-10T16:00:00', color: '#8b5cf6' },
        { id: 'J2', label: 'Task J2', start: '2025-08-10T17:00:00', end: '2025-08-11T09:00:00', color: '#7c3aed' },
        { id: 'J3', label: 'Task J3', start: '2025-08-12T07:00:00', end: '2025-08-12T18:00:00', color: '#6d28d9', successors: ['K2'] }
      ]
    },
    {
      id: 'M11',
      name: 'Machine K',
      tasks: [
        { id: 'K1', label: 'Task K1', start: '2025-08-10T11:00:00', end: '2025-08-10T19:00:00', color: '#f97316' },
        { id: 'K2', label: 'Task K2', start: '2025-08-12T19:00:00', end: '2025-08-13T11:00:00', color: '#ea580c', successors: ['L3'] },
        { id: 'K3', label: 'Task K3', start: '2025-08-13T12:00:00', end: '2025-08-13T20:00:00', color: '#dc2626' }
      ]
    },
    {
      id: 'M12',
      name: 'Machine L',
      tasks: [
        { id: 'L1', label: 'Task L1', start: '2025-08-10T14:00:00', end: '2025-08-11T02:00:00', color: '#14b8a6' },
        { id: 'L2', label: 'Task L2', start: '2025-08-11T03:00:00', end: '2025-08-11T12:00:00', color: '#0d9488' },
        { id: 'L3', label: 'Task L3', start: '2025-08-13T12:00:00', end: '2025-08-14T06:00:00', color: '#0f766e', successors: ['M2'] }
      ]
    },
    {
      id: 'M13',
      name: 'Machine M',
      tasks: [
        { id: 'M1', label: 'Task M1', start: '2025-08-10T15:00:00', end: '2025-08-11T01:00:00', color: '#64748b' },
        { id: 'M2', label: 'Task M2', start: '2025-08-14T07:00:00', end: '2025-08-14T18:00:00', color: '#475569' }
      ]
    }
  ];
  viewStart = new Date('2025-08-10T00:00:00');
  viewEnd = new Date('2025-08-19T00:00:00');


}
