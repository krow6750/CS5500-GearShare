// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  EQUIPMENT: 'equipment',
  REPAIRS: 'repairs',
  RENTALS: 'rentals',
  ACTIVITY_LOGS: 'activityLogs'
};

// Database schemas
export const SCHEMAS = {
  users: {
    user_id: 'number',
    user_name: 'string',
    email: 'string',
    password: 'string',
    role: 'string'
  },
  equipment: {
    equipment_id: 'number',
    name: 'string',
    equipment_category: 'string',
    status: 'string',
    current_owned_user_id: 'number',
    price: 'number',
    airtableId: 'string',
    booqableId: 'string'
  },
  repairs: {
    repair_ticket_id: 'number',
    equipment_type: 'string',
    reported_by: 'number',
    assigned_to: 'number',
    issue_description: 'string',
    start_date: 'timestamp',
    end_date: 'timestamp',
    status: 'string',
    cost: 'number',
    estimate_repair_time: 'number',
    airtableId: 'string'
  },
  rentals: {
    rental_id: 'number',
    user_id: 'number',
    equipment_id: 'number',
    start_date: 'timestamp',
    end_date: 'timestamp',
    total_cost: 'number',
    status: 'string',
    booqableId: 'string'
  },
  activityLogs: {
    log_id: 'number',
    user_id: 'number',
    action_type: 'string',
    description: 'string',
    activity_time: 'timestamp'
  }
};

// Status enums for consistency
export const STATUS = {
  EQUIPMENT: {
    AVAILABLE: 'available',
    RENTED: 'rented',
    IN_REPAIR: 'in_repair'
  },
  REPAIR: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
  },
  RENTAL: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled'
  }
};

// Role types
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user'
};
