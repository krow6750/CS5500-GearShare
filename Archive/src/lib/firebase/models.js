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
    owner: 'string',
    internal_notes: 'string',
    date_quoted: 'number',
    status: 'string',
    type_of_item: 'string',
    brand: 'string',
    color: 'string',
    damage_or_defect: 'string',
    photo_attachment: 'string',
    price_quote: 'number',
    final_price: 'number',
    amount_paid: 'number',
    payment_type:'string', 
    delivery_of_item: 'string',
    requestor_type: 'string', 
    repair_event: 'string',
    first_name:'string',
    last_name:'string', 
    telephone:'string',
    email: 'string',
    referred_by: 'string',
    submitted_on: 'timestamp',
    created:'timestamp',
    autonumber:'number',
    paid_on:'timestamp',
    item_type:'string',
    weight:'number',
    for_zapier:'timestamp',
    send_date_quote:"string",
    send_price_email:'string'
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
    FINISHED_PICKED_UP: 'Finished, Picked Up',
    IN_REPAIR: 'In Repair',
    DROPPED_OFF_AWAITING_REPAIR: 'Dropped Off, Awaiting Repair'
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
