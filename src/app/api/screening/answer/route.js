import { NextResponse } from "next/server";
import { openai, supabase } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { screening_id, answer } = await body;

    if (!screening_id || !answer) {
      return NextResponse.json({ status: false, message: "screening_id and answer required" }, { status: 400 });
    }

    // Fetch session
    const { data: screening, error } = await supabase
      .from("screening_sessions")
      .select("*")
      .eq("id", screening_id)
      .single();

    if (error || !screening) {
      return NextResponse.json({ status: false, message: "Screening not found" }, { status: 404 });
    }

    if (screening.status === "complete") {
      return NextResponse.json({ status: false, message: "Screening already completed", next_steps: "start_again_screening_if_needed" }, { status: 400 });
    }

    // Update answers
    const answers = Array.isArray(screening.answers) ? [...screening.answers] : [];
    const stage = screening.stage || 1;
    answers.push({ question_id: `q${stage}`, answer });

    // If stage < 5, ask next question
    if (stage < 5) {
      const prompt = `
You are Mediconnect AI — a triage assistant.
The patient initially reported: "${screening.initial_symptom}".
Previous Q&A:
${answers.map((a, i) => `${i + 1}. ${a.question_id}: ${a.answer}`).join("\n")}

Now ask ONE next follow-up question to understand more.
Return only JSON:
{
  "question": { "id": "q${stage + 1}", "text": "string", "type": "text" }
}
`;

      const aiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: prompt }],
      });

      const content = aiRes.choices?.[0]?.message?.content;
      const aiData = JSON.parse(content);

      // Update stage & question
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

    // ---- If stage == 5: return diagnosis ----
    const prompt = `
You are Mediconnect AI — a clinical assistant.
The patient initially said: "${screening.initial_symptom}"
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
      messages: [{ role: "system", content: prompt }],
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
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
