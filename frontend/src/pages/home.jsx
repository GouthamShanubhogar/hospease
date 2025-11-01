import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">🏥 HospEase</h1>
      <p className="text-gray-600 mb-6">
        Smart Hospital Queue Management System
      </p>
      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
