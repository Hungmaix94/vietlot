"use client";

import { useQuery } from "@tanstack/react-query";

interface Submission {
    id: string;
    userId: string;
    user: { username: string };
    spinResultId: string;
    tickets: number[][];
    createdAt: string;
}

export default function AdminDashboard() {
    const { data, isLoading, error } = useQuery<{ submissions: Submission[] }>({
        queryKey: ["submissions"],
        queryFn: async () => {
            const res = await fetch("/api/submissions");
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "Failed to fetch submissions");
            return d;
        },
    });

    if (isLoading) return <div className="p-8 font-semibold">Loading submissions...</div>;
    if (error) return <div className="p-8 text-red-500 font-semibold">Error: {(error as any).message}</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard - All Submissions</h1>

            {data?.submissions.length === 0 ? (
                <div className="bg-white p-6 rounded shadow border text-gray-500">No submissions found.</div>
            ) : (
                <div className="space-y-6">
                    {data?.submissions.map((sub) => (
                        <div key={sub.id} className="bg-white p-6 rounded shadow border">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                <div>
                                    <h3 className="font-semibold text-lg">User: {sub.user.username}</h3>
                                    <span className="text-gray-500 text-sm">ID: {sub.userId}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium text-gray-600">Submitted at:</span>
                                    <div className="text-sm text-gray-800">{new Date(sub.createdAt).toLocaleString()}</div>
                                </div>
                            </div>

                            <div>
                                <span className="font-medium text-gray-700">Tickets ({sub.tickets.length}):</span>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sub.tickets.map((t, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="font-semibold text-gray-500 w-6">#{i + 1}</span>
                                            <div className="flex gap-1">
                                                {t.map((num, idx) => (
                                                    <div key={idx} className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold rounded-full text-xs">
                                                        {num}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
