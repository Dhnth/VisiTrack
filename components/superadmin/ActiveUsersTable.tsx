"use client";

const usersData = [
  { users: "32,984", clicks: "2.42m", sales: "$2,400", items: "320" },
  { users: "28,432", clicks: "1.89m", sales: "$1,890", items: "280" },
  { users: "25,123", clicks: "1.65m", sales: "$1,650", items: "245" },
];

export default function ActiveUsersTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Active Users</h3>
        <p className="text-sm text-green-600 mt-1">(+23) than last week</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usersData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-3 text-sm text-gray-800">{row.users}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{row.clicks}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{row.sales}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{row.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}