export default function SyncIndicator({ status }) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'syncing':
        return (
          <div className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing with Booqable....
          </div>
        );
      case 'success':
        return (
          <div className="text-green-500 flex items-center">
            ✓ Synced successfully
          </div>
        );
      case 'error':
        return (
          <div className="text-red-500 flex items-center">
            ❌ Sync failed
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-sm">
      {getStatusDisplay()}
    </div>
  );
} 