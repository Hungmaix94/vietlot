import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const systemInstruction = "You are an expert lottery statistician and data analyst specializing in Vietlott Power 6/55. Your goal is to maximize the user's probability of winning the jackpot by combining historical frequency data, mathematical distribution, and advanced patterns.";

        const prompt = `
        Dựa trên phân tích xác suất thống kê chuyên sâu và dữ liệu lịch sử của xổ số Vietlott Power 6/55:
        1. Hãy phân tích ma trận tần suất, chu kỳ xuất hiện của các con số.
        2. Sinh ra cho tôi bộ 6 con số đẹp nhất, tiềm năng trúng Jackpot cao nhất, hoàn toàn KHÔNG TRÙNG LẶP từ 1 đến 55.
        3. Hãy đưa ra một lời giải thích (phân tích) ngắn gọn, cực kỳ thuyết phục và mang đầy năng lượng tích cực, may mắn bằng tiếng Việt để người dùng tin tưởng vào các con số này.
        
        Bạn bắt buộc phải trả về JSON theo đúng định dạng sau:
        {
            "numbers": [n1, n2, n3, n4, n5, n6],
            "explanation": "Câu phân tích xác suất kết hợp lời chúc may mắn rực rỡ."
        }
        `;

        try {
            // First attempt: OpenAI (GPT-4o-mini)
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
            });

            const responseText = response.choices[0].message.content;
            if (!responseText) {
                throw new Error("OpenAI returned empty response");
            }

            const data = JSON.parse(responseText);

            // Validate the numbers
            let finalNumbers = data.numbers;
            if (!Array.isArray(finalNumbers) || finalNumbers.length !== 6 || new Set(finalNumbers).size !== 6) {
                throw new Error("Invalid format returned from OpenAI.");
            }

            return NextResponse.json({
                numbers: finalNumbers.sort((a: number, b: number) => a - b),
                explanation: data.explanation || "Chúc bạn may mắn nhé! (Powered by OpenAI)",
            });

        } catch (openaiError) {
            console.warn("OpenAI failed, falling back to Gemini:", openaiError);

            // Second attempt: Gemini (fallback)
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro-latest",
                systemInstruction,
            });

            // Gemini specific prompt (doesn't have structured output like OpenAI JSON object natively as easily without schema, so text response parsing)
            const geminiPrompt = prompt + "\nTrả về JSON thuần túy, không format markdown.";

            const result = await model.generateContent(geminiPrompt);
            const responseText = result.response.text();

            // Extract JSON
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Gemini did not return valid JSON");
            }

            const data = JSON.parse(jsonMatch[0]);

            let finalNumbers = data.numbers;
            if (!Array.isArray(finalNumbers) || finalNumbers.length !== 6 || new Set(finalNumbers).size !== 6) {
                throw new Error("Invalid format returned from Gemini.");
            }

            return NextResponse.json({
                numbers: finalNumbers.sort((a: number, b: number) => a - b),
                explanation: data.explanation || "Chúc bạn may mắn nhé! (Powered by Gemini)",
            });
        }
    } catch (error) {
        console.error("All AI Generative engines failed:", error);

        // Fallback generator just in case ALL APIs fail
        const result = new Set<number>();
        while (result.size < 6) {
            result.add(Math.floor(Math.random() * 55) + 1);
        }
        return NextResponse.json({
            numbers: Array.from(result).sort((a, b) => a - b),
            explanation: "Hệ thống AI đang bận nên mình đã chọn cho bạn 6 số may mắn ngẫu nhiên. Chúc bạn một ngày tốt lành!"
        });
    }
}
