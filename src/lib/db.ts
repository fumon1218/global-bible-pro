import Dexie, { Table } from 'dexie';

export interface BibleVersionData {
  id: string; // Version ID (e.g. 'NKRV')
  data: any;  // The whole JSON object
  updatedAt: number;
}

export class BibleDatabase extends Dexie {
  versions!: Table<BibleVersionData>;

  constructor() {
    super('BibleDatabase');
    this.version(1).stores({
      versions: 'id'
    });
  }
}

export const db = new BibleDatabase();
