// context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // ⚡ Immediately unblock UI
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name:
          firebaseUser.displayName ||
          firebaseUser.email.split("@")[0],
        plan: "free", // default
      });
      setLoading(false);

      // 🔁 Load plan async (non-blocking)
      getDoc(doc(db, "users", firebaseUser.uid))
        .then((snap) => {
          if (snap.exists()) {
            setUser((prev) => ({
              ...prev,
              plan: snap.data().plan || "free",
            }));
          }
        })
        .catch(console.error);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
