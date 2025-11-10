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

    // Step 1: Check if input is medical-related
    const checkPrompt = `
You are a strict classifier for a medical triage assistant.

Determine if the following user message is **medical-related** (describing symptoms, health concerns, illnesses, pain, or medications)
or **non-medical** (like greetings, jokes, general topics, etc.).

Return strictly in JSON format:
{
  "is_medical": true | false
}

User message: "${initial_symptoms}"
`;

    const checkRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: checkPrompt }],
    });

    let classification;
    try {
      classification = JSON.parse(checkRes.choices?.[0]?.message?.content || "{}");
    } catch (err) {
      classification = { is_medical: true }; // default fallback
    }

    // Step 2: Stop if not medical
    if (!classification.is_medical) {
      return NextResponse.json({
        status: false,
        message:
          "Sorry, I can only assist with medical-related concerns. Please describe your symptoms or health issue.",
      });
    }

    // Step 3: Proceed with question generation
    const screening_id = uuidv4();

    const prompt = `
You are Mediconnect AI — a clinical triage assistant.
A patient reports: "${initial_symptoms}".

Ask ONE short, clear follow-up question to understand more about their condition.
Return strictly JSON:
{
  "question": { "id": "q1", "text": "string", "type": "text" }
}
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    let aiData;
    try {
      aiData = JSON.parse(aiRes.choices?.[0]?.message?.content || "{}");
    } catch (err) {
      aiData = {
        question: { id: "q1", text: "Can you tell me more about your symptoms?", type: "text" },
      };
    }

    // Step 4: Save to Supabase
    await supabase.from("screening_sessions").insert([
      {
        id: screening_id,
        patient_id,
        stage: 0, // 👈 stage starts at 0
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
      stage: 0, // 👈 returned as 0 too
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
