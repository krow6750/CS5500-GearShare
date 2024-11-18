import { activityService } from '@/lib/activity/activityService';
import useAuthStore from '@/store/authStore';

export function useActivityLog() {
  const { user } = useAuthStore();

  const logActivity = async (action_type, description) => {
    try {
      await activityService.logActivity({
        user_id: user?.uid || 'system',
        action_type,
        description,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
}
