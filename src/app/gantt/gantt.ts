import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

/**
* Minimal, pure-Angular SVG Gantt chart (no external libraries)
* - Multiple machines (rows)
* - Each machine has multiple batches
* - Batches span hours or days
* - Connectors show flow from one batch to the next (even across machines)
* - Basic zoom (hours/day) and panning via native scrolling
*
* Usage:
* <app-gantt
* [machines]="machines"
* [viewStart]="new Date('2025-08-10T00:00:00')"
* [viewEnd]="new Date('2025-08-20T00:00:00')">
* </app-gantt>
*/

export type BatchId = string;

export interface Batch {
  id: BatchId;
  label: string;
  start: Date | string;
  end: Date | string;
  color?: string;
  // IDs of successor batches; connector lines will be drawn from this batch to each successor
  successors?: BatchId[];
}

export interface Machine {
  id: string;
  name: string;
  batches: Batch[];
}

@Component({
  selector: 'app-gantt',
  imports: [CommonModule],
  templateUrl: './gantt.html',
  styleUrl: './gantt.scss'
})
export class Gantt {

  @Input() machines: Machine[] = [];
  @Input() viewStart: Date = new Date(new Date().setHours(0, 0, 0, 0));
  @Input() viewEnd: Date = new Date(new Date().setDate(new Date().getDate() + 7));


  // Layout constants
  pxPerHour = 12; // Zoom factor
  rowHeight = 48; // Row height
  leftGutter = 160; // Space for machine names
  headerHeight = 28; // Top padding for day labels


  // Computed layout
  totalWidth = 1000;
  totalHeight = 300;
  timeWidth = 0;


  gridDays: { x: number; label: string; }[] = [];
  rowLayout: { machine: Machine; y: number; }[] = [];
  batchLayout: Array<{
    id: string; label: string; x: number; y: number; w: number; start: Date; end: Date; color?: string;
  }> = [];
  connectors: Array<{ from: string; to: string; path: string; }> = [];


  hover: any = null;
  Math = Math;


  ngOnChanges(changes: SimpleChanges): void {
    this.recompute();
  }

  // ===== Public controls =====
  zoomIn() { this.pxPerHour = Math.min(200, Math.round(this.pxPerHour * 1.25)); this.recompute(); }
  zoomOut() { this.pxPerHour = Math.max(1, Math.round(this.pxPerHour / 1.25)); this.recompute(); }
  zoomHours(hoursPerCell: number) {
    // Quick presets: 12(px/hr) ~= hourly; 24(px/hr) ~= daily width
    this.pxPerHour = hoursPerCell;
    this.recompute();
  }

  private recompute() {
    const start = new Date(this.viewStart);
    const end = new Date(this.viewEnd);


    // Row layout
    this.rowLayout = this.machines.map((m, i) => ({ machine: m, y: this.headerHeight + i * this.rowHeight }));
    this.totalHeight = this.headerHeight + this.rowLayout.length * this.rowHeight + 8;


    // Width
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    this.timeWidth = Math.max(0, hours * this.pxPerHour);
    this.totalWidth = this.leftGutter + this.timeWidth + 40;


    // Grid (days)
    this.gridDays = [];
    const dayMs = 24 * 3600 * 1000;
    const firstDay = new Date(start); firstDay.setHours(0, 0, 0, 0);
    for (let t = firstDay.getTime(); t <= end.getTime(); t += dayMs) {
      const x = this.leftGutter + this.dateToX(new Date(t), start);
      this.gridDays.push({ x, label: new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) });
    }

    // Batch rectangles
    const batchById = new Map<BatchId, { x: number; y: number; w: number; start: Date; end: Date; label: string; id: string; color?: string }>();
    this.batchLayout = [];
    for (let r = 0; r < this.rowLayout.length; r++) {
      const row = this.rowLayout[r];
      for (const b of (row.machine.batches || [])) {
        const s = new Date(b.start as any);
        const e = new Date(b.end as any);
        const x = this.leftGutter + this.dateToX(s, start);
        const w = Math.max(4, this.dateToX(e, start) - this.dateToX(s, start));
        const y = row.y;
        const item = { id: b.id, label: b.label, x, y, w, start: s, end: e, color: b.color };
        this.batchLayout.push(item);
        batchById.set(b.id, item);
      }
    }

    // Connectors
    this.connectors = [];
    for (const m of this.machines) {
      for (const b of (m.batches || [])) {
        if (!b.successors) continue;
        for (const toId of b.successors) {
          const from = batchById.get(b.id);
          const to = batchById.get(toId);
          if (!from || !to) continue;
          const path = this.makeConnectorPath(from, to);
          this.connectors.push({ from: b.id, to: toId, path });
        }
      }
    }
  }

  private dateToX(d: Date, start: Date) {
    const ms = d.getTime() - start.getTime();
    const hours = ms / (1000 * 60 * 60);
    return hours * this.pxPerHour;
  }

  private makeConnectorPath(from: { x: number; y: number; w: number }, to: { x: number; y: number }) {
    // Right middle of from → left middle of to
    const x1 = from.x + from.w;
    const y1 = from.y + this.rowHeight / 2;
    const x2 = to.x;
    const y2 = to.y + this.rowHeight / 2;


    // Horizontal offset for curves
    const dx = Math.max(24, (x2 - x1) / 2);


    const c1x = x1 + dx;
    const c1y = y1;
    const c2x = x2 - dx;
    const c2y = y2;


    return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
  }

  get todayX(): number | null {
    const t = new Date();
    if (t < this.viewStart || t > this.viewEnd) return null;
    const x = this.leftGutter + this.dateToX(t, this.viewStart);
    return x;
  }

}
