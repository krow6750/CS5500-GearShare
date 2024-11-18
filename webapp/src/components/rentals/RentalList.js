import { formatDate, formatDateOnly } from '@/lib/utils/dateFormat';

// In your component:
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {formatDateOnly(rental.start_date)}
</td> 