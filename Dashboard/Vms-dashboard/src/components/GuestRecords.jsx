import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

export default function GuestRecords() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: "",
    apartmentNo: "",
    status: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Step 1: Fetch all guest records
        const guestSnapshot = await getDocs(collection(db, "guests"));
        let guestsData = guestSnapshot.docs.map(doc => {
          const data = doc.data();
          const entry = data.entryTime?.toDate();
          const exit = data.exitTime?.toDate();
          return {
            id: doc.id,
            ...data,
            visitDate: entry?.toISOString().split("T")[0],
            entryTimeFormatted: entry?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || "",
            exitTimeFormatted: exit?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ""
          };
        });

        // Step 2: Get unique apartmentHolderIds
        const holderIds = [...new Set(guestsData.map(g => g.apartmentHolderId))];

        // Step 3: Fetch all relevant users
        const userQuery = query(
          collection(db, "users"),
          where("uid", "in", holderIds.slice(0, 10)) // Firestore "in" only supports max 10 items at a time
        );
        const userSnapshot = await getDocs(userQuery);
        const userMap = {};
        userSnapshot.docs.forEach(doc => {
          const data = doc.data();
          userMap[data.uid] = data.apartmentNo || "N/A";
        });

        // Step 4: Map apartmentNo back to guests
        guestsData = guestsData.map(g => ({
          ...g,
          apartmentNo: userMap[g.apartmentHolderId] || "Unknown"
        }));

        // Step 5: Apply filters
        const filtered = guestsData.filter(g => {
          const matchDate = filters.date ? g.visitDate === filters.date : true;
          const matchStatus = filters.status ? g.status === filters.status : true;
          const matchApartment = filters.apartmentNo ? g.apartmentNo === filters.apartmentNo : true;
          return matchDate && matchStatus && matchApartment;
        });

        setGuests(filtered);
      } catch (err) {
        console.error("Error loading guest records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Guest Records</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apartment No</label>
            <input
              type="text"
              name="apartmentNo"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={filters.apartmentNo}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ date: "", apartmentNo: "", status: "" })}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading guest records...</div>
      ) : guests.length === 0 ? (
        <div className="text-center py-10">No guest records found</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scans</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guests.map(guest => (
                <tr key={guest.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                    <div className="text-sm text-gray-500">{guest.nic}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.apartmentNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest.visitDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest.entryTimeFormatted} - {guest.exitTimeFormatted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${guest.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        guest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        guest.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest.scansLeft}/2
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
