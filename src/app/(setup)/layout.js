export default function SetupLayout({ children }) {
  // No auth provider here
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 