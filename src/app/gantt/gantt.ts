import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';

export type TaskId = string;

export interface Resource {
  resourceId: string;
  name: string;
  tasks: Task[];
}
export interface Batch {
  batchId: string;
  label: string;
  color?: string;
}
export interface Task {
  taskId: TaskId;
  batchId?: string; // Optional, if task is part of a batch
  label: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  successors?: TaskId[];
}

@Component({
  selector: 'app-gantt',
  imports: [CommonModule, ReactiveFormsModule, AngularSplitModule],
  templateUrl: './gantt.html',
  styleUrl: './gantt.scss'
})
export class Gantt {
  @Input() resources: Resource[] = [];
  @Input() viewStart: Date = new Date(new Date().setHours(0, 0, 0, 0));
  @Input() viewEnd: Date = new Date(new Date().setDate(new Date().getDate() + 7));


  batches: Batch[] = [
    { batchId: '1', label: 'Batch 1', color: '#ff0000' },
    { batchId: '2', label: 'Batch 2', color: '#00ff00' },
    { batchId: '3', label: 'Batch 3', color: '#0000ff' },
    { batchId: '4', label: 'Batch 4', color: '#ffff00' },
    { batchId: '5', label: 'Batch 5', color: '#ff00ff' },
    { batchId: '6', label: 'Batch 6', color: '#00ffff' },
  ]

  // Layout constants
  pxPerHour = 30; // pixels per hour
  rowHeight = 48;
  leftGutter = 0;
  headerHeight = 30;

  // Computed layout
  totalWidth = 1000;
  totalHeight = 300;
  timeWidth = 0;

  showGridHours: boolean = true
  gridDays: { x: number; label: string; }[] = [];
  gridHours: { x: number; label: string; }[] = [];
  rowLayout: { resource: Resource; y: number; }[] = [];
  batchLayout: Array<{ id: string; label: string; x: number; y: number; w: number; start: Date; end: Date; color?: string }> = [];
  connectors: Array<{ from: string; to: string; points: string; }> = [];

  hover: any = null;
  Math = Math;
  todayX: number | null = null;

  taskForm!: FormGroup

  constructor(
    private readonly formBuilder: FormBuilder
  ) {
    this.initTaskForm()
  }

  initTaskForm(): void {
    this.taskForm = this.formBuilder.group({
      resourceId: ['', [Validators.required]],
      taskId: ['', Validators.required],
      batchId: [''],
      taskName: ['', Validators.required],
      taskStart: [null, [Validators.required]],
      taskEnd: [null, [Validators.required]],
      color: ['', Validators.required],
      successors: ['']
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.recompute();
  }

  zoomIn() { this.pxPerHour = Math.min(200, Math.round(this.pxPerHour * 1.25)); this.recompute(); }
  zoomOut() { this.pxPerHour = Math.max(1, Math.round(this.pxPerHour / 1.25)); this.recompute(); }
  zoomHours(hoursPerCell: number) { this.pxPerHour = hoursPerCell; this.recompute(); }

  private recompute() {

    const { minDate, maxDate } = this.getMinMaxDates();
    const start = new Date(minDate);
    const end = new Date(maxDate);

    // Calculate todayX once
    const t = new Date();
    if (t < start || t > end) {
      this.todayX = null;
    } else {
      this.todayX = this.leftGutter + this.dateToX(t, start);
    }

    // const start = new Date(this.viewStart);
    // const end = new Date(this.viewEnd);

    this.rowLayout = this.resources.map((m, i) => ({ resource: m, y: this.headerHeight + i * this.rowHeight }));
    this.totalHeight = this.headerHeight + this.rowLayout.length * this.rowHeight + 8;

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    this.timeWidth = Math.max(0, hours * this.pxPerHour);
    this.totalWidth = this.leftGutter + this.timeWidth + 40;

    // Days grid
    this.gridDays = [];
    const dayMs = 24 * 3600 * 1000;
    const firstDay = new Date(start); firstDay.setHours(0, 0, 0, 0);
    for (let t = firstDay.getTime(); t <= end.getTime(); t += dayMs) {
      const x = this.leftGutter + this.dateToX(new Date(t), start);
      this.gridDays.push({ x, label: new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) });
    }

    // Hours grid
    this.gridHours = [];
    const hourMs = 3600 * 1000;
    const firstHour = new Date(start); firstHour.setMinutes(0, 0, 0);
    for (let t = firstHour.getTime(); t <= end.getTime(); t += hourMs) {
      const d = new Date(t);
      const x = this.leftGutter + this.dateToX(d, start);
      this.gridHours.push({ x, label: d.getHours().toString().padStart(2, '0') + ":00" });
    }

    const batchById = new Map<TaskId, { x: number; y: number; w: number; start: Date; end: Date; label: string; id: string; color?: string }>();
    this.batchLayout = [];
    for (let r = 0; r < this.rowLayout.length; r++) {
      const row = this.rowLayout[r];
      for (const b of (row.resource.tasks || [])) {
        const s = new Date(b.start as any);
        const e = new Date(b.end as any);
        const x = this.leftGutter + this.dateToX(s, start);
        const w = Math.max(4, this.dateToX(e, start) - this.dateToX(s, start));
        const y = row.y;
        const item = { id: b.taskId, label: b.label, x, y, w, start: s, end: e, color: b.color };
        this.batchLayout.push(item);
        batchById.set(b.taskId, item);
      }
    }

    // Build connectors
    this.connectors = [];
    for (const m of this.resources) {
      for (const b of (m.tasks || [])) {
        if (!b.successors) continue;
        for (const toId of b.successors) {
          const from = batchById.get(b.taskId);
          const to = batchById.get(toId);
          if (!from || !to) continue;

          const points = this.makeConnectorPoints(from, to);
          this.connectors.push({ from: b.taskId, to: toId, points });
        }
      }
    }
  }

  private dateToX(d: Date, start: Date) {
    const ms = d.getTime() - start.getTime();
    const hours = ms / (1000 * 60 * 60);
    return hours * this.pxPerHour;
  }

  private makeConnectorPoints(
    from: { x: number; y: number; w: number },
    to: { x: number; y: number }
  ) {
    const padding = 4; // space between task and arrow
    const x1 = from.x + from.w + padding; // start a bit outside the task
    const y1 = from.y + this.rowHeight / 2;
    const x2 = to.x - padding; // end a bit before the next task
    const y2 = to.y + this.rowHeight / 2;

    const points: string[] = [];
    points.push(`${x1},${y1}`);

    if (y1 === y2) {
      // Same row → straight
      points.push(`${x2},${y2}`);
    } else {
      // Different row → elbow
      const midX = (x1 + x2) / 2;
      points.push(`${midX},${y1}`);
      points.push(`${midX},${y2}`);
      points.push(`${x2},${y2}`);
    }

    return points.join(" ");
  }

  addTask() {

    console.log(this.taskForm.value)
    return
    const now = new Date();
    const later = new Date(now.getTime() + 2 * 3600 * 1000); // 2 hours later
    const newBatch: Task = {
      taskId: this.taskForm.get('taskId')?.value,
      label: this.taskForm.get('taskName')?.value,
      start: this.taskForm.get('taskStart')?.value,
      end: this.taskForm.get('taskEnd')?.value,
      color: this.taskForm.get('color')?.value,
    };

    var machine = this.resources.find(f => f.resourceId == this.taskForm.get('resourceId')?.value)!
    console.log(machine)
    machine.tasks.push(newBatch);
    // machine.tasks.push(newBatch);
    this.recompute(); // refresh layout
  }

  toggleGridHours(): void {
    this.showGridHours = !this.showGridHours
  }

  getMinMaxDates(): { minDate: Date, maxDate: Date } {
    const dates = this.resources.flatMap(m => m.tasks.flatMap(b => [b.start, b.end])).map(d => new Date(d));
    const result = {
      minDate: new Date(Math.min(...dates.map(d => d.getTime()))),
      maxDate: new Date(Math.max(...dates.map(d => d.getTime())))
    };
    return result;
  }

  openTaskForm(resourceId: string) {
    this.taskForm.get('resourceId')?.setValue(resourceId)
    this.taskForm.get('taskId')?.setValue(this.generateTaskId())
  }

  // generate a random taskid
  generateTaskId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  getBatchColor(): string {
    const batchId = this.taskForm.get('batchId')?.value;
    if (!batchId) return '#000000'; // Default color if no batch selected
    const batch = this.batches.find(b => b.batchId === batchId);
    return batch ? batch.color! : '#000000';
  }

  getElementColor(task: Task): string {
    return task.color || this.getBatchColor();
  }

}
