"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            if (data.user.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-red-600 to-rose-900">
            <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-2xl">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
                        🍀
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800 tracking-tight">Vietlot <span className="text-red-600">6/55</span></h1>
                {error && <div className="mb-4 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none text-gray-800"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none text-gray-800"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                        Sign In & Play
                    </button>
                </form>
            </div>
        </div>
    );
}
