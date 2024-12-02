// Temporary placeholder until Firebase is fully removed
export const firebaseDB = {
  async create() { return null; },
  async get() { return null; },
  async update() { return null; },
  async delete() { return null; },
  async query() { return []; }
};

export const COLLECTIONS = {
  REPAIRS: 'repairs',
  EQUIPMENT: 'equipment',
  RENTALS: 'rentals',
  ACTIVITY_LOGS: 'activity_logs'
}; 