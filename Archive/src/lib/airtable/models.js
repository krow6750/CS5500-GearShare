export const TABLES = {
  REPAIRS: 'Repairs'
};

export const STATUS = {
  STATUS: {
    'Finished, Picked Up': 'Finished, Picked Up',
    'Contacted, Awaiting Customer Response': 'Contacted, Awaiting Customer Response',
    'Awaiting Drop-Off': 'Awaiting Drop-Off',
    'Can\'t Repair': 'Can\'t Repair',
    'Finished + Paid, In Drop-Box': 'Finished + Paid, In Drop-Box',
    'Dropped Off, Awaiting Repair': 'Dropped Off, Awaiting Repair',
    'Finished, Customer Contacted': 'Finished, Customer Contacted',
    'In Repair': 'In Repair'
  },

  PAYMENTTYPE: {
    'cash': 'cash',
    'check': 'check',
    'Square': 'Square',
    'Venmo': 'Venmo',
    'combo': 'combo'
  },

  REQUESTOR_TYPE: {
    'Board/Staff': 'Board/Staff',
    'Paying Customer': 'Paying Customer',
    'MGS/Internal': 'MGS/Internal',
    'Maloja Warranty': 'Maloja Warranty',
    'Free, repair event': 'Free, repair event',
    'Stio Warranty': 'Stio Warranty'
  }
};

export const DEFAULT_STATUS = 'New';
