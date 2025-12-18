import { Result } from './Result';

export interface WithChanges {
  changes: Changes;
}

export class Changes {
  private changes: Result<unknown>[];

  constructor() {
    this.changes = [];
  }

  public addChange<T>(result: Result<T>): void {
    this.changes.push(result as Result<unknown>);
  }

  public getChangeResult(): Result<unknown> {
    return Result.combine(this.changes);
  }
}
