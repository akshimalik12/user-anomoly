import { NextResponse } from 'next/server';

const quizzes = [
    { id: 1, question: "What is 5 + 3?", answer: "8" },
    { id: 2, question: "What is the capital of France?", answer: "paris" },
    { id: 3, question: "Type the word 'human' backwards:", answer: "namuh" },
    { id: 4, question: "What is 10 - 4?", answer: "6" },
    { id: 5, question: "Which number is larger: 42 or 24?", answer: "42" },
];

export async function GET() {
    const q = quizzes[Math.floor(Math.random() * quizzes.length)];
    return NextResponse.json({ id: q.id, question: q.question });
}

export async function POST(req: Request) {
    try {
        const { id, answer } = await req.json();
        const q = quizzes.find(x => x.id === id);
        if (q && q.answer.toLowerCase() === answer.toLowerCase().trim()) {
            return NextResponse.json({ success: true, token: `verified-${Date.now()}` });
        }
        return NextResponse.json({ success: false, error: "Incorrect answer" });
    } catch (err) {
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }
}
