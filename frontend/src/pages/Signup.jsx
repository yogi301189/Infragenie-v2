// frontend/src/pages/Signup.jsx

import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createUserDocIfMissing = async (user) => {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        email: user.email,
        plan: "free",
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUserDocIfMissing(cred.user);

      navigate("/");
    } catch (err) {
      console.error(err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email already registered");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        default:
          setError("Signup failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      await createUserDocIfMissing(cred.user);

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Google signup failed");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">IG</div>

        <h1 className="auth-title">📝 Sign up for InfraGenie</h1>
        <p className="auth-subtitle">InfraGenie welcomes you!</p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="auth-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="auth-primary-btn"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-slate-500 text-xs">
          <div className="flex-1 h-px bg-slate-700" />
          OR
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        <button onClick={handleGoogleSignup} className="auth-google-btn">
          <svg width="18" height="18" viewBox="0 0 48 48">
            {/* Google SVG unchanged */}
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-sm text-slate-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
