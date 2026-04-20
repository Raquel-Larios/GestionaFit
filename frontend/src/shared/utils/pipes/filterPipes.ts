import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterAssigned' })
export class FilterAssignedPipe implements PipeTransform {
  transform(items: any[], assignedIds: number[]): any[] {
    return items.filter(item => assignedIds.includes(item.id));
  }
}

@Pipe({ name: 'filterUnassigned' })
export class FilterUnassignedPipe implements PipeTransform {
  transform(items: any[], assignedIds: number[]): any[] {
    return items.filter(item => !assignedIds.includes(item.id));
  }
}