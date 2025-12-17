import { NextResponse } from "next/server";
import { openai, supabase } from "@/lib/supabaseAdmin";

/* =====================================================
   UTILITIES
===================================================== */

function clean(text) {
  return text?.trim().slice(0, 500) || "";
}

/* =====================================================
   AI RELEVANCE CHECK (CORE LOGIC)
===================================================== */

function buildRelevancePrompt(question, answer) {
  return `
You are a medical triage validator.

Your task:
- Decide whether the PATIENT ANSWER is relevant and appropriate
  for the MEDICAL QUESTION asked.

Rules:
- If the question asks about duration (how long / since when),
  valid answers include time expressions like:
  "2 days", "since yesterday", "3 hours", "kal se".
- If the question asks yes/no, answers like "yes" or "no" are valid.
- If the question asks for description, short answers like "ok", "yes", "no" are NOT valid.
- Answers like "ok", "idk", "fine", "thanks" are NOT valid for any question.
- Do NOT judge medical correctness.
- ONLY judge relevance to the question.

Return ONLY valid JSON:
{
  "is_relevant": true | false,
  "reason": "short explanation"
}

Medical Question:
"${question}"

Patient Answer:
"${answer}"
`;
}

async function checkAnswerRelevance(question, answer) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content: buildRelevancePrompt(question, answer),
        },
      ],
    });

    return JSON.parse(res.choices[0].message.content);
  } catch (err) {
    console.error("AI relevance check failed:", err);

    // SAFE FALLBACK (never block valid duration)
    if (/\d+\s?(day|days|hour|hours|week|weeks|month|months)/i.test(answer)) {
      return { is_relevant: true, reason: "Duration detected by fallback." };
    }

    return {
      is_relevant: false,
      reason: "Unable to understand your answer. Please answer the question clearly.",
    };
  }
}

/* =====================================================
   API HANDLER
===================================================== */

export async function POST(req) {
  try {
    const { screening_id, answer } = await req.json();

    if (!screening_id || !answer) {
      return NextResponse.json(
        { status: false, message: "screening_id and answer are required" },
        { status: 400 }
      );
    }

    const cleanAnswer = clean(answer);

    /* ---------- Fetch Screening ---------- */
    const { data: screening, error } = await supabase
      .from("screening_sessions")
      .select("*")
      .eq("id", screening_id)
      .single();

    if (error || !screening) {
      return NextResponse.json(
        { status: false, message: "Screening session not found" },
        { status: 404 }
      );
    }

    if (screening.status === "complete") {
      return NextResponse.json({
        status: false,
        message: "This screening is already completed",
      });
    }

    const stage = screening.stage || 0;
    const lastQuestion = screening.questions?.[stage];

    if (!lastQuestion) {
      return NextResponse.json(
        { status: false, message: "Question not found for this stage" },
        { status: 400 }
      );
    }

    /* =====================================================
       AI-BASED RELEVANCE VALIDATION (KEY PART)
    ===================================================== */

    const relevance = await checkAnswerRelevance(
      lastQuestion.text,
      cleanAnswer
    );

    if (!relevance.is_relevant) {
      return NextResponse.json({
        status: false,
        alert: true,
        message: relevance.reason,
        expected_question: lastQuestion.text,
      });
    }

    /* ---------- Save Answer ---------- */
    const answers = [...(screening.answers || [])];
    answers.push({
      question_id: lastQuestion.id,
      answer: cleanAnswer,
      at: new Date().toISOString(),
    });

    /* ---------- Next Question or Complete ---------- */
    if (stage < 4) {
      let nextQuestion;

      try {
        const prompt = `
You are a clinical triage assistant.

Conversation so far:
${answers.map(a => `Q:${a.question_id} A:${a.answer}`).join("\n")}

Ask ONE next medically relevant question.
Return STRICT JSON:
{
  "id": "q${stage + 2}",
  "text": "question text"
}
`;

        const ai = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.4,
          messages: [{ role: "system", content: prompt }],
        });

        nextQuestion = JSON.parse(ai.choices[0].message.content);
      } catch {
        nextQuestion = {
          id: `q${stage + 2}`,
          text: "Can you describe any other symptoms you are experiencing?",
        };
      }

      await supabase
        .from("screening_sessions")
        .update({
          stage: stage + 1,
          answers,
          questions: [...screening.questions, nextQuestion],
          updated_at: new Date().toISOString(),
        })
        .eq("id", screening_id);

      return NextResponse.json({
        status: true,
        stage: stage + 1,
        next_question: nextQuestion,
      });
    }

    /* ---------- Complete Screening ---------- */
    await supabase
      .from("screening_sessions")
      .update({
        status: "complete",
        answers,
        updated_at: new Date().toISOString(),
      })
      .eq("id", screening_id);

    return NextResponse.json({
      status: true,
      message: "Health screening completed successfully",
    });
  } catch (err) {
    console.error("Screening API error:", err);
    return NextResponse.json(
      { status: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
