// src/components/DashboardHome.jsx
import { useState, useEffect } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../firebase";

export default function DashboardHome() {
  const [counts, setCounts] = useState({
    security: 0,
    apartmentHolders: 0,
    activeGuests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        const securityColl = collection(db, "users");
        const securityQuery = query(securityColl, where("role", "==", "security"), where("active", "==", true));
        const securitySnapshot = await getCountFromServer(securityQuery);
        
        const apartmentColl = collection(db, "users");
        const apartmentQuery = query(apartmentColl, where("role", "==", "apartment_holder"), where("active", "==", true));
        const apartmentSnapshot = await getCountFromServer(apartmentQuery);
        
        const guestsColl = collection(db, "guests");
        const guestsQuery = query(guestsColl, where("status", "==", "confirmed"));
        const guestsSnapshot = await getCountFromServer(guestsQuery);
        
        setCounts({
          security: securitySnapshot.data().count,
          apartmentHolders: apartmentSnapshot.data().count,
          activeGuests: guestsSnapshot.data().count
        });
      } catch (err) {
        console.error("Error fetching counts:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      
      {loading ? (
        <div className="text-center py-10">Loading dashboard data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Security Personnel</h3>
            <p className="text-3xl font-bold text-indigo-600">{counts.security}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Apartment Holders</h3>
            <p className="text-3xl font-bold text-indigo-600">{counts.apartmentHolders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Active Guests Today</h3>
            <p className="text-3xl font-bold text-indigo-600">{counts.activeGuests}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {/* Activity log component would go here */}
        <p className="text-gray-500">Recent guest entries and system activities will appear here</p>
      </div>
    </div>
  );
}