"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const ticketSchema = z.array(
    z.number().min(1).max(55)
).length(6).refine(nums => new Set(nums).size === 6, {
    message: "Numbers must be unique in each ticket"
});

const formSchema = z.object({
    tickets: z.array(ticketSchema)
});

type FormValues = z.infer<typeof formSchema>;

export default function TicketForm({ spinResultId, maxTickets }: { spinResultId: string, maxTickets: number }) {
    const [success, setSuccess] = useState(false);
    const [aiExplanation, setAiExplanation] = useState("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tickets: Array(maxTickets).fill([0, 0, 0, 0, 0, 0])
        }
    });

    const generateAiMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/ai");
            return await res.json();
        },
        onSuccess: (data, index: number) => {
            form.setValue(`tickets.${index}`, data.numbers);
            setAiExplanation(data.explanation);
        }
    });

    const generateAllAiMutation = useMutation({
        mutationFn: async () => {
            const promises = Array.from({ length: maxTickets }).map(() => fetch("/api/ai").then(res => res.json()));
            return await Promise.all(promises);
        },
        onSuccess: (results) => {
            results.forEach((data, index) => {
                form.setValue(`tickets.${index}`, data.numbers);
            });
            // Just use the explanation from the first one for simplicity, or combine them
            setAiExplanation("Đã tạo tự động tất cả các vé bằng AI! " + results[0].explanation);
        }
    });

    const submitMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ spinResultId, tickets: values.tickets })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data;
        },
        onSuccess: () => setSuccess(true),
        onError: (err: any) => alert(err.message)
    });

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 text-green-700 font-bold text-center mt-6 p-6 rounded-2xl shadow-sm text-lg animate-fade-in-up">
                🎉 Chúc mừng! Các vé của bạn đã được gửi thành công. Chúc bạn may mắn! 🍀
            </div>
        );
    }

    return (
        <form onSubmit={form.handleSubmit((d) => submitMutation.mutate(d))} className="space-y-6">
            {aiExplanation && (
                <div className="bg-blue-50/80 border border-blue-100 text-blue-800 p-5 rounded-2xl text-sm mb-6 shadow-sm leading-relaxed">
                    <strong className="text-blue-900 block mb-1 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Trợ lý AI phân tích:
                    </strong>
                    {aiExplanation}
                </div>
            )}

            {maxTickets > 1 && (
                <div className="flex justify-end mb-4">
                    <button
                        type="button"
                        onClick={() => generateAllAiMutation.mutate()}
                        disabled={generateAllAiMutation.isPending}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <span>🪄</span> {generateAllAiMutation.isPending ? "Đang tạo tất cả..." : "Hỏi AI Cho Tất Cả Các Vé"}
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {Array.from({ length: maxTickets }).map((_, i) => (
                    <div key={i} className="border border-gray-200 p-5 rounded-2xl bg-white hover:border-red-300 transition-colors flex flex-col xl:flex-row gap-5 items-center shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-3 w-full xl:w-auto">
                            <span className="font-bold text-lg text-gray-700 whitespace-nowrap bg-gray-100 px-3 py-1 rounded-lg">Vé {i + 1}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center flex-grow">
                            {[0, 1, 2, 3, 4, 5].map((numIdx) => (
                                <input
                                    key={numIdx}
                                    type="number"
                                    min="1"
                                    max="55"
                                    {...form.register(`tickets.${i}.${numIdx}`, { valueAsNumber: true })}
                                    className="w-14 h-14 sm:w-16 sm:h-16 text-center text-xl font-bold rounded-full border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100/50 text-red-600 shadow-inner transition-all hover:-translate-y-0.5"
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="w-full xl:w-auto px-5 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 border border-red-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            onClick={() => generateAiMutation.mutate(i as any)}
                            disabled={generateAiMutation.isPending}
                        >
                            <span>✨</span> Hỏi AI
                        </button>
                    </div>
                ))}
            </div>

            <div className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg inline-block">
                {Object.keys(form.formState.errors).length > 0 && "⚠ Vui lòng đảm bảo mỗi vé có 6 số không trùng lặp từ 1 đến 55."}
            </div>

            <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xl py-5 rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
                {submitMutation.isPending ? "Đang Gửi..." : "🚀 CHỐT SỐ TAY - RƯỚC NGAY TỶ PHÚ"}
            </button>
        </form>
    );
}
