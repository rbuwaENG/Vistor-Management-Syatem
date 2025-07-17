// src/components/RegisterApartmentHolder.jsx
import { useState } from "react";

export default function RegisterApartmentHolder() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    apartmentNo: "",
    location: "",
    membershipStart: "",
    membershipEnd: "",
    address: "",
    age: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    try {
      const response = await fetch("https://us-central1-vms-db-cb72b.cloudfunctions.net/registerApartmentHolder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong.");
      }

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        apartmentNo: "",
        location: "",
        membershipStart: "",
        membershipEnd: "",
        address: "",
        age: ""
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Register Apartment Holder</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">Apartment holder registered successfully!</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password", type: "password" },
            { name: "apartmentNo", label: "Apartment Number", type: "text" },
            { name: "location", label: "Location", type: "text" },
            { name: "membershipStart", label: "Membership Start", type: "date" },
            { name: "membershipEnd", label: "Membership End", type: "date" },
            { name: "address", label: "Address", type: "text" },
            { name: "age", label: "Age", type: "number", min: 18 }
          ].map(({ name, label, type, min }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                name={name}
                required
                min={min}
                value={formData[name]}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
        >
          Register Apartment Holder
        </button>
      </form>
    </div>
  );
}
