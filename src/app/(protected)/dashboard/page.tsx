"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import TicketForm from "@/components/TicketForm";

export default function Dashboard() {
    const [spinResult, setSpinResult] = useState<{ tickets: number; spinResultId: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch on mount to see if user has already spun
    useEffect(() => {
        fetch("/api/spin", { method: "POST" })
            .then(res => res.json())
            .then(data => {
                if (data.alreadySpun || data.spinResultId) {
                    setSpinResult({ tickets: data.tickets, spinResultId: data.spinResultId });
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const spinMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/spin", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message);
            return data;
        },
        onSuccess: (data) => {
            setSpinResult({ tickets: data.tickets, spinResultId: data.spinResultId });
        },
        onError: (err: any) => {
            setError(err.message);
        }
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600 tracking-tight">
                        Power 6/55
                    </h1>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-red-100">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-sm font-medium text-gray-600">Session Active</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-white p-12 rounded-3xl shadow-xl border border-red-50 text-center max-w-2xl mx-auto flex flex-col items-center justify-center animate-pulse">
                        <div className="w-24 h-24 bg-red-100 rounded-full mb-6"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-4 bg-gray-100 rounded w-2/3 mb-8"></div>
                        <div className="h-14 bg-red-200 rounded-2xl w-48"></div>
                    </div>
                ) : !spinResult ? (
                    <div className="bg-white p-12 rounded-3xl shadow-xl shadow-red-100/50 border border-red-50 text-center max-w-2xl mx-auto transform transition-all hover:scale-[1.01]">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <span className="text-4xl">🎰</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Vòng Quay May Mắn</h2>
                        <p className="mb-8 text-lg text-gray-500">Thử vận may của bạn! Nhấn để quay và nhận số lượng vé khởi ngiệp miễn phí.</p>
                        <button
                            onClick={() => spinMutation.mutate()}
                            disabled={spinMutation.isPending}
                            className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white font-bold text-lg rounded-2xl hover:from-red-700 hover:to-rose-600 disabled:opacity-50 transition-all shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 w-full sm:w-auto overflow-hidden"
                        >
                            {spinMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Đang Quay...
                                </span>
                            ) : (
                                "🌟 QUAY NGAY 🌟"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-red-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-8 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="text-3xl">🎉</span>
                                    Chúc mừng! Bạn nhận được {spinResult.tickets} vé!
                                </h2>
                                <p className="text-gray-500 mt-2">Hãy điền những con số may mắn của bạn hoặc để AI hỗ trợ.</p>
                            </div>
                            <div className="mt-4 sm:mt-0 px-4 py-2 bg-red-50 rounded-xl text-red-700 font-bold border border-red-100">
                                {spinResult.tickets} Vé Chưa Sử Dụng
                            </div>
                        </div>

                        <TicketForm spinResultId={spinResult.spinResultId} maxTickets={spinResult.tickets} />
                    </div>
                )}
            </div>
        </div>
    );
}
