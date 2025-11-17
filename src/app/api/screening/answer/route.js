import { NextResponse } from "next/server";
import { openai, supabase } from "@/lib/supabaseAdmin";

const SYMPTOM_KEYWORDS = [
  // english
  "fever", "cough", "cold", "pain", "headache", "dizziness", "nausea", "vomit", "breath", "shortness", "sore", "throat",
  "chest", "bleed", "bleeding", "itch", "rash", "swelling", "infection", "fatigue", "weakness", "coughing", "sneeze",
  // common hinglish/hindi terms (romanized)
  "khansi", "khansi", "khansi se", "khansi ho rahi", "bukhar", "dard", "dard hai", "sirdard", "pet dard", "chakkar",
  " ulti", "ulti", "saans", "saans lene", "thakan", "kamzori", "sardi", "jukaam", "zukaam", "balgam", "khun", "khansi",
  // medicines words
  "tablet", "syrup", "medicine", "dawa", "dawai", "dose", "mg", "injection", "ointment"
];

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/\u200B|\uFEFF/g, "") // invisible chars
    .replace(/[^\w\s\u0900-\u097F]/g, " ") // keep Devanagari and word characters, replace punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function localHeuristicClassify(answer, lastQuestionType = null) {
  // Return { is_medical: bool, confidence: 0..1, reason: string, predicted_type: string }
  const raw = String(answer || "");
  const text = normalize(raw);

  if (!text) {
    return { is_medical: false, confidence: 0.3, reason: "empty_or_whitespace", predicted_type: "other" };
  }

  // common short replies mapping
  const YES_NO = ["yes", "no", "haan", "nahi", "haanji", "nahin", "ha", "na", "y", "n"];
  // synonyms for ok/good etc that are non-medical
  const NON_MED_FILLERS = ["ok", "okay", "fine", "thik", "thik hai", "good", "thank you", "thanks", "thanks.", "thanks"];

  // quick check: if exactly a yes/no and last question is yes/no -> medical
  if (YES_NO.includes(text) || YES_NO.includes(text.split(" ")[0])) {
    if (lastQuestionType === "yes_no") {
      return { is_medical: true, confidence: 0.98, reason: "short_yes_no_answer_to_yes_no_question", predicted_type: "yes_no" };
    }
    // If there is medical context in question already, still treat as medical but slightly lower confidence
    if (lastQuestionType === "text" || lastQuestionType == null) {
      return { is_medical: true, confidence: 0.85, reason: "short_yes_no_in_medical_context", predicted_type: "yes_no" };
    }
  }

  // duration detection: "2 days", "4 months", "kal se", "aaj se", "since yesterday"
  const durationRegex = /\b(\d+\s*(days?|day|months?|month|weeks?|week|hrs?|hours?|hour))\b|\b(kal se|aaj se|kal|yesterday|since yesterday|for \d+)\b/;
  if (durationRegex.test(text)) {
    return { is_medical: true, confidence: 0.95, reason: "duration_mentioned", predicted_type: "duration" };
  }

  // numeric answers that could be durations / temperatures / counts (eg "38.5", "102", "3")
  const numericOnly = /^\d+(\.\d+)?$/;
  if (numericOnly.test(text)) {
    // numeric alone — could be temperature or days. Treat as medical with moderate confidence.
    return { is_medical: true, confidence: 0.8, reason: "numeric_only_maybe_temp_or_duration", predicted_type: "numeric" };
  }

  // symptom keywords (English + romanized Hindi)
  for (const kw of SYMPTOM_KEYWORDS) {
    if (text.includes(kw)) {
      return { is_medical: true, confidence: 0.95, reason: `contains_symptom_keyword:${kw}`, predicted_type: "symptom" };
    }
  }

  // contains medicine words
  if (/\b(tablet|syrup|mg|injection|dose|ointment|dawa|dawai)\b/.test(text)) {
    return { is_medical: true, confidence: 0.92, reason: "mentions_medicine_or_dose", predicted_type: "medication" };
  }

  // explicit greetings or filler -> non-medical
  if (NON_MED_FILLERS.some(f => text === f || text.startsWith(f + " "))) {
    return { is_medical: false, confidence: 0.95, reason: "greeting_or_filler", predicted_type: "other" };
  }

  // short ambiguous tokens like "maybe", "thoda" -> these are often relevant in med triage
  if (/\b(maybe|thoda|thoda sa|thoda sa hi|thodasa|kuchh|kuch)\b/.test(text)) {
    return { is_medical: true, confidence: 0.78, reason: "ambiguous_but_often_medical_shortreply", predicted_type: "other" };
  }

  // fallback: uncertain
  return { is_medical: false, confidence: 0.45, reason: "heuristic_uncertain", predicted_type: "other" };
}

async function callOpenAIForClassification(answer, context = {}) {
  // context may include initial_symptoms, previous Q&A, last_question_type, language hints
  const { initial_symptoms = "", lastQa = "" } = context;

  const prompt = `
You are a strict medical-response classifier for a clinical triage assistant. 
Decide whether the user's reply is related to a medical condition or symptom.

Consider:
- Short answers (yes/no/haan/nahi) should be considered medical if they reply to a medical yes/no question or the conversation is clearly medical.
- Durations ("2 days", "kal se", "since yesterday") are medical.
- Mentions of body parts, symptoms, medicines, doses, or changes in condition are medical.
- Greetings/fillers ("hi", "ok", "fine", "thx") are NOT medical.
- The user may reply in English, Hindi (Devanagari), or Hinglish (romanized Hindi).

You MUST RETURN EXACTLY valid JSON (no extra text). Format:
{
  "is_medical": true|false,
  "confidence": 0.0-1.0,
  "reason": "short explanation (one line)",
  "predicted_type": "yes_no|duration|symptom|medication|numeric|other"
}

Context:
Initial symptom: "${initial_symptoms}"
Previous Q&A: ${lastQa}
User reply: "${answer}"
`;

  const aiRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: prompt }],
    // you may pass other call params like temperature if you want
  });

  const raw = aiRes.choices?.[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(raw);
    // sanitize numeric range for confidence
    if (!parsed || typeof parsed.is_medical === "undefined") {
      return { is_medical: false, confidence: 0.5, reason: "openai_malformed_response", predicted_type: "other" };
    }
    parsed.confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0.6));
    return parsed;
  } catch (err) {
    // fallback if parse fails
    return { is_medical: false, confidence: 0.5, reason: "openai_json_parse_error", predicted_type: "other" };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { screening_id, answer } = body;

    if (!screening_id || typeof answer === "undefined") {
      return NextResponse.json(
        { status: false, message: "screening_id and answer required" },
        { status: 400 }
      );
    }

    // Fetch screening
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

    // Determine last question type from stored questions (if any)
    const lastQuestion = (screening.questions || []).slice(-1)[0] || null;
    const lastQuestionType = lastQuestion?.type || null;

    // Local heuristic classification first
    const heuristic = localHeuristicClassify(answer, lastQuestionType);

    let classification = null;

    // If heuristic is very confident (>= 0.9) accept directly
    if (heuristic.confidence >= 0.9) {
      classification = {
        is_medical: heuristic.is_medical,
        confidence: heuristic.confidence,
        reason: `heuristic:${heuristic.reason}`,
        predicted_type: heuristic.predicted_type,
      };
    } else {
      // If heuristic uncertain or moderate confidence, call OpenAI for better judgement
      // Provide helpful context: initial symptoms and last Q/A
      const lastQa = (screening.answers || [])
        .map((a, i) => `${i + 1}. ${a.question_id}: ${a.answer}`)
        .join("\n");
      const openaiResult = await callOpenAIForClassification(answer, {
        initial_symptoms: screening.initial_symptoms || "",
        lastQa,
      });

      // Merge heuristic and openaiResult: prefer openaiResult unless it's low confidence
      if (openaiResult.confidence >= 0.6) {
        classification = openaiResult;
        // if heuristic thought yes_no and openai agrees -> boost confidence
        if (heuristic.predicted_type === "yes_no" && openaiResult.predicted_type === "yes_no") {
          classification.confidence = Math.min(1, classification.confidence + 0.1);
          classification.reason = (classification.reason || "") + " +heuristic_yesno";
        }
      } else {
        // openai uncertain: fall back to heuristic but mark lower confidence
        classification = {
          is_medical: heuristic.is_medical,
          confidence: heuristic.confidence * 0.85,
          reason: `fallback_heuristic:${heuristic.reason}; openai_low_confidence`,
          predicted_type: heuristic.predicted_type,
        };
      }
    }

    // If classification says non-medical -> reply with message and do NOT progress stage
    if (!classification.is_medical) {
      return NextResponse.json({
        status: false,
        message:
          "Sorry, your response doesn’t appear to be related to a medical condition. Please answer with information about your symptoms or health issue.",
        classification,
      });
    }

    // Proceed: store answer and progress
    const answers = Array.isArray(screening.answers) ? [...screening.answers] : [];
    const stage = screening.stage || 0;
    answers.push({ question_id: `q${stage}`, answer, classification });

    // If stage < 5, ask next question
    if (stage < 5) {
      const prompt = `
You are Mediconnect AI — a clinical triage assistant.
The patient initially reported: "${screening.initial_symptoms || ""}".
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

      await supabase
        .from("screening_sessions")
        .update({
          stage: stage + 1,
          answers,
          questions: [...(screening.questions || []), aiData.question],
          updated_at: new Date().toISOString(),
        })
        .eq("id", screening_id);

      return NextResponse.json({
        status: true,
        stage: stage + 1,
        screening_id,
        next_question: aiData.question,
        classification,
      });
    }

    // Stage == 5 -> final diagnosis
    const diagnosisPrompt = `
You are Mediconnect AI — a clinical assistant.
The patient initially said: "${screening.initial_symptoms || ""}"
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

    const content = aiRes.choices?.[0]?.message?.content || "{}";
    let aiData;
    try {
      aiData = JSON.parse(content);
    } catch (err) {
      aiData = {
        summary: "Could not generate structured analysis.",
        probable_diagnoses: [],
        recommended_specialties: [],
        specializations: [],
        recommended_lab_tests: [],
        recommended_medicines: [],
        urgency: "routine",
      };
    }

    await supabase
      .from("screening_sessions")
      .update({
        status: "complete",
        analysis: aiData,
        answers,
        stage: stage + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", screening_id);

    return NextResponse.json({
      status: true,
      screening_id,
      stage: stage + 1,
      analysis: aiData,
      classification,
      message: "Screening complete",
    });
  } catch (error) {
    console.error("Answer Error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
