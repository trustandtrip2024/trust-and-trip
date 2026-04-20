import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trust and Trip Admin</h1>
        <p className="text-gray-500 mb-6">Internal tools</p>
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          View Leads Dashboard
        </Link>
      </div>
    </div>
  );
}
