export default function EquipmentDetailPage({ params }) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Equipment Details</h1>
        <p className="mt-4 text-gray-500">Equipment ID: {params.id}</p>
      </div>
    );
  }