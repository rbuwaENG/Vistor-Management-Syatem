import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, signOut, createUserWithEmailAndPassword } from "firebase/auth"; // Added missing import

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Authenticate user
      const userCredential = await login(email, password);
      const user = userCredential.user;
      
      // 2. Get user document by UID
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not registered in the system");
      }
      
      const userData = userDoc.data();
      if (userData.role !== "manager") {
        // Sign out non-manager users
        await signOut(getAuth());
        throw new Error("Only managers can access this dashboard");
      }
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  const handleManagerRegistration = async (e) => {
    e.preventDefault();
    try {
      // 1. Validate signup code (use env variable in production)
      if (signupCode !== "MANAGER123") {
        throw new Error("Invalid registration code");
      }
      
      // 2. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
      const user = userCredential.user;
      
      // 3. Create manager document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "manager",
        createdAt: new Date(),
        active: true
      });
      
      // 4. Automatically log in the new manager
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isRegistering ? "Manager Registration" : "Manager Login"}
          </h2>
        </div>
        
        {error && <div className="text-red-500 text-center p-3 bg-red-50 rounded-md">{error}</div>}
        
        <form 
          className="mt-8 space-y-6" 
          onSubmit={isRegistering ? handleManagerRegistration : handleLogin}
        >
          {isRegistering && (
            <>
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="signupCode" className="sr-only">Registration Code</label>
                <input
                  id="signupCode"
                  name="signupCode"
                  type="password"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Registration Code"
                  value={signupCode}
                  onChange={(e) => setSignupCode(e.target.value)}
                />
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isRegistering ? "Register Manager" : "Sign in"}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(""); // Clear errors when toggling
            }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            {isRegistering 
              ? "Already have an account? Sign in" 
              : "Need a manager account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}