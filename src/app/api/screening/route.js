import { NextResponse } from "next/server";
import { openai, supabase } from "@/lib/supabaseAdmin";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const body = await req.json();
    const { patient_id, initial_symptoms } = body;

    if (!patient_id || !initial_symptoms) {
      return NextResponse.json(
        {
          status: false,
          message: `Missing required fields: patient_id, initial_symptoms`,
        },
        { status: 400 }
      );
    }

    const screening_id = uuidv4();

    const prompt = `
You are Mediconnect AI — a clinical triage assistant.
A patient reports: "${initial_symptoms}".

Ask ONE short, clear follow-up question to understand more.
Return strictly JSON:
{
  "question": { "id": "q1", "text": "string", "type": "text" }
}
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    const content = aiRes.choices?.[0]?.message?.content;
    const aiData = JSON.parse(content);

    // Store new screening session
    await supabase.from("screening_sessions").insert([
      {
        id: screening_id,
        patient_id,
        stage: 1,
        initial_symptoms,
        questions: [aiData.question],
        answers: [{ question_id: "q0", answer: initial_symptoms }],
        status: "in_progress",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    return NextResponse.json({
      status: true,
      screening_id,
      stage: 1,
      next_question: aiData.question,
    });
  } catch (error) {
    console.error("Start Error:", error);
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}
