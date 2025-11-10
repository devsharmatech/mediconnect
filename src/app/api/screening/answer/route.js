import { NextResponse } from "next/server";
import { openai, supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { screening_id, answer } = body;

    if (!screening_id || !answer) {
      return NextResponse.json(
        { status: false, message: "screening_id and answer required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch screening session
    const { data: screening, error } = await supabase
      .from("screening_sessions")
      .select("*")
      .eq("id", screening_id)
      .single();

    if (error || !screening) {
      return NextResponse.json(
        { status: false, message: "Screening not found" },
        { status: 404 }
      );
    }

    if (screening.status === "complete") {
      return NextResponse.json(
        {
          status: false,
          message: "Screening already completed",
          next_steps: "start_again_screening_if_needed",
        },
        { status: 400 }
      );
    }

    // 🧠 Step 2: Validate that the answer is medical-related
    const checkPrompt = `
You are a strict classifier for a medical triage assistant.
Determine if the user's answer below is **medical-related** — meaning it describes
symptoms, diseases, body issues, medications, or treatments.

If the answer is unrelated (greetings, jokes, sports, general talk), mark it as false.

Return only valid JSON:
{
  "is_medical": true | false
}

User message: "${answer}"
`;

    const checkRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: checkPrompt }],
    });

    let classification;
    try {
      classification = JSON.parse(checkRes.choices?.[0]?.message?.content || "{}");
    } catch {
      classification = { is_medical: false }; // default to false if uncertain
    }

    // ❌ Step 3: If not medical — don't progress, just respond
    if (!classification.is_medical) {
      return NextResponse.json({
        status: false,
        message:
          "Sorry, your response doesn’t appear to be related to a medical condition. Please answer with information about your symptoms or health issue.",
      });
    }

    // ✅ Step 4: Proceed if valid
    const answers = Array.isArray(screening.answers)
      ? [...screening.answers]
      : [];
    const stage = screening.stage || 0;
    answers.push({ question_id: `q${stage}`, answer });

    // If stage < 5, ask next question
    if (stage < 5) {
      const prompt = `
You are Mediconnect AI — a clinical triage assistant.
The patient initially reported: "${screening.initial_symptoms}".
Previous Q&A:
${answers.map((a, i) => `${i + 1}. ${a.question_id}: ${a.answer}`).join("\n")}

Ask ONE next short medical follow-up question to understand more.
Return strictly JSON:
{
  "question": { "id": "q${stage + 1}", "text": "string", "type": "text" }
}
`;

      const aiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
      });

      let aiData;
      try {
        aiData = JSON.parse(aiRes.choices?.[0]?.message?.content || "{}");
      } catch {
        aiData = {
          question: {
            id: `q${stage + 1}`,
            text: "Can you tell me more about your symptoms?",
            type: "text",
          },
        };
      }

      // ✅ Update stage only if valid medical answer
      await supabase
        .from("screening_sessions")
        .update({
          stage: stage + 1,
          answers,
          questions: [...(screening.questions || []), aiData.question],
          updated_at: new Date(),
        })
        .eq("id", screening_id);

      return NextResponse.json({
        status: true,
        stage: stage + 1,
        screening_id,
        next_question: aiData.question,
      });
    }

    // 🩺 Step 5: Generate final diagnosis at stage == 5
    const diagnosisPrompt = `
You are Mediconnect AI — a clinical assistant.
The patient initially said: "${screening.initial_symptoms}"
Their answers were:
${answers.map((a, i) => `${i + 1}. ${a.question_id}: ${a.answer}`).join("\n")}

Now analyze and return strictly JSON:
{
  "summary": "",
  "probable_diagnoses": [{"name": "", "confidence": 0.0}],
  "recommended_specialties": ["", ""],
  "specializations": ["", ""],
  "recommended_lab_tests": ["", ""],
  "recommended_medicines": [{"name": "", "dose": "", "notes": ""}],
  "urgency": "routine|urgent|emergency"
}
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: diagnosisPrompt }],
    });

    const content = aiRes.choices?.[0]?.message?.content;
    const aiData = JSON.parse(content);

    await supabase
      .from("screening_sessions")
      .update({
        status: "complete",
        analysis: aiData,
        answers,
        stage: stage + 1,
        updated_at: new Date(),
      })
      .eq("id", screening_id);

    return NextResponse.json({
      status: true,
      screening_id,
      stage: stage + 1,
      analysis: aiData,
      message: "Screening complete",
    });
  } catch (error) {
    console.error("Answer Error:", error);
    return NextResponse.json(
      { status: false, message: error.message },
      { status: 500 }
    );
  }
}
