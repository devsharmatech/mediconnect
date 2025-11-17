import { NextResponse } from "next/server";
import { openai, supabase } from "@/lib/supabaseAdmin";

// Rate limiting storage (in production, use Redis)
const requestCounts = new Map();

function checkRateLimit(screeningId) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!requestCounts.has(screeningId)) {
    requestCounts.set(screeningId, []);
  }
  
  const requests = requestCounts.get(screeningId).filter(time => time > windowStart);
  requestCounts.set(screeningId, requests);
  
  if (requests.length >= 10) { // 10 requests per minute
    return false;
  }
  
  requests.push(now);
  return true;
}

function safeJSONParse(str, fallback = {}) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("JSON Parse Error:", error, "String:", str);
    return fallback;
  }
}

function cleanInput(text) {
  if (!text) return "";
  return text.trim().slice(0, 500); // Limit input length
}

function getGuidanceMessage(answer) {
  const lowerAnswer = answer.toLowerCase();
  
  if (lowerAnswer.match(/^(na|no|nahi|nahi hai)$/)) {
    return "If you don't have other symptoms, you can say: 'Only fever, no other symptoms' or 'Sirf fever hai, kuch aur nahi'";
  }
  
  if (lowerAnswer.match(/^(yes|haan|han|ji haan)$/)) {
    return "Please specify what other symptoms you're experiencing. For example: 'Yes, I also have cough and headache'";
  }
  
  if (answer.length < 3) {
    return "Please provide more details about your symptoms. For example: how long you've had them, where exactly you feel pain, or how severe it is.";
  }
  
  if (lowerAnswer.includes('thank') || lowerAnswer.includes('thanks')) {
    return "You're welcome! To help you better, please describe your symptoms so I can provide appropriate medical guidance.";
  }
  
  return "Please describe your symptoms, such as: 'I have fever since yesterday' or 'Mujhe khansi aur body pain hai' or 'Headache for 2 days'";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { screening_id, answer } = body;

    // Validate required fields
    if (!screening_id || !answer) {
      return NextResponse.json(
        { status: false, message: "screening_id and answer are required" },
        { status: 400 }
      );
    }

    // Clean and validate input
    const cleanAnswer = cleanInput(answer);
    if (!cleanAnswer) {
      return NextResponse.json(
        { status: false, message: "Please provide a valid response" },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(screening_id)) {
      return NextResponse.json(
        { status: false, message: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // Step 1: Fetch screening session
    const { data: screening, error: screeningError } = await supabase
      .from("screening_sessions")
      .select("*")
      .eq("id", screening_id)
      .single();

    if (screeningError || !screening) {
      return NextResponse.json(
        { status: false, message: "Screening session not found" },
        { status: 404 }
      );
    }

    // Check if screening is already complete
    if (screening.status === "complete") {
      return NextResponse.json(
        {
          status: false,
          message: "This health screening has already been completed.",
          next_steps: "start_again_screening_if_needed",
        },
        { status: 400 }
      );
    }

    // 🧠 Step 2: Enhanced Medical Response Validation
    const checkPrompt = `
You are a medical response classifier for a healthcare triage system. Your task is to determine if the user's response is related to medical symptoms, conditions, or health concerns.

MEDICAL RESPONSES INCLUDE:
- Symptoms: fever, cough, cold, headache, pain, dizziness, nausea, vomiting, fatigue, weakness
- Body parts: head, chest, stomach, throat, legs, arms, back, etc.
- Duration: "2 days", "kal se", "since yesterday", "4 hours", "1 week"
- Severity: "mild", "severe", "thoda", "bahut", "unbearable"
- Medical history: "I have diabetes", "asthma patient", "heart problem"
- Medications: "taking medicine", "paracetamol", "inhaler"
- Health concerns: "not feeling well", "feeling sick", "body not working"

NON-MEDICAL RESPONSES INCLUDE:
- Greetings: "hello", "hi", "namaste", "good morning"
- Small talk: "I'm fine", "thanks", "okay", "good"
- Unrelated topics: weather, food, work (unless related to health)
- Very short responses: "na", "no", "yes" without context
- App feedback: "good bot", "thank you", "helpful"

USER RESPONSE: "${cleanAnswer}"

Analyze the response and return ONLY valid JSON:
{
  "is_medical": true | false,
  "reason": "brief explanation for your decision"
}
`;

    const checkRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: checkPrompt }],
      temperature: 0.1, // Lower temperature for more consistent classification
    });

    const classification = safeJSONParse(
      checkRes.choices?.[0]?.message?.content || "{}",
      { is_medical: false, reason: "Failed to parse classification" }
    );

    // Log non-medical responses for analysis
    if (!classification.is_medical) {
      console.log(`Non-medical response - Screening: ${screening_id}, Answer: "${cleanAnswer}", Reason: ${classification.reason}`);
    }

    // ❌ Step 3: Enhanced non-medical response handling
    if (!classification.is_medical) {
      const guidanceMessage = getGuidanceMessage(cleanAnswer);
      
      return NextResponse.json({
        status: false,
        message: `I understand you said: "${cleanAnswer}". ${guidanceMessage}`,
        requires_clarification: true
      });
    }

    // ✅ Step 4: Proceed with medical screening
    const answers = Array.isArray(screening.answers)
      ? [...screening.answers]
      : [];
    const stage = screening.stage || 0;
    
    // Add the current answer
    answers.push({ 
      question_id: `q${stage}`, 
      answer: cleanAnswer,
      timestamp: new Date().toISOString()
    });

    // If stage < 5, ask next question
    if (stage < 5) {
      const nextQuestionPrompt = `
You are Mediconnect AI — a professional clinical triage assistant.

PATIENT INITIAL SYMPTOMS: "${screening.initial_symptoms}"

CONVERSATION HISTORY:
${answers.map((a, i) => `Q${i}: ${a.question_id} → A${i}: ${a.answer}`).join("\n")}

Based on the conversation so far, ask ONE natural, conversational follow-up question to better understand the patient's condition.

Consider:
- Previous symptoms mentioned
- Need for clarification
- Typical medical triage progression
- Cultural sensitivity for Indian patients

Return strictly JSON format:
{
  "question": {
    "id": "q${stage + 1}",
    "text": "Your next question here...",
    "type": "text"
  }
}

Make the question clear, empathetic, and medically relevant.
`;

      const aiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: nextQuestionPrompt }],
        temperature: 0.7,
      });

      const aiData = safeJSONParse(
        aiRes.choices?.[0]?.message?.content || "{}",
        {
          question: {
            id: `q${stage + 1}`,
            text: "Can you tell me more about your symptoms?",
            type: "text",
          },
        }
      );

      // Update screening session with new question and answer
      const { error: updateError } = await supabase
        .from("screening_sessions")
        .update({
          stage: stage + 1,
          answers,
          questions: [...(screening.questions || []), aiData.question],
          updated_at: new Date().toISOString(),
        })
        .eq("id", screening_id);

      if (updateError) {
        console.error("Update error:", updateError);
        return NextResponse.json(
          { status: false, message: "Failed to update screening session" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: true,
        stage: stage + 1,
        screening_id,
        next_question: aiData.question,
        progress: {
          current: stage + 1,
          total: 5,
          percentage: Math.round(((stage + 1) / 5) * 100)
        }
      });
    }

    // 🩺 Step 5: Generate final diagnosis at stage == 5
    const diagnosisPrompt = `
You are Mediconnect AI — a professional clinical assistant providing preliminary assessment.

PATIENT INITIAL SYMPTOMS: "${screening.initial_symptoms}"

SYMPTOM HISTORY:
${answers.map((a, i) => `${i + 1}. ${a.question_id}: ${a.answer}`).join("\n")}

Based on the information provided, generate a comprehensive medical assessment.

Return STRICTLY VALID JSON with this structure:
{
  "summary": "Brief overview of patient's condition",
  "probable_diagnoses": [
    {"name": "Condition name", "confidence": 0.85, "notes": "Supporting reasons"}
  ],
  "recommended_specialties": ["Specialty1", "Specialty2"],
  "specializations": ["Specific area of specialization"],
  "recommended_lab_tests": ["Test1", "Test2"],
  "recommended_medicines": [
    {"name": "Medicine name", "dose": "Recommended dose", "notes": "Important precautions"}
  ],
  "urgency": "routine|urgent|emergency",
  "home_care_advice": ["Advice1", "Advice2"],
  "warning_signs": ["Sign1 that requires immediate attention", "Sign2"]
}

Important:
- Be clinically accurate but cautious
- Confidence scores should be realistic (0.0-1.0)
- Only recommend OTC medications when appropriate
- Consider Indian healthcare context
- Urgency levels: "emergency" for life-threatening, "urgent" for same-day care, "routine" for non-urgent
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: diagnosisPrompt }],
      temperature: 0.3,
    });

    const content = aiRes.choices?.[0]?.message?.content;
    const aiData = safeJSONParse(content, {
      summary: "Unable to generate assessment",
      probable_diagnoses: [],
      recommended_specialties: ["General Physician"],
      specializations: [],
      recommended_lab_tests: [],
      recommended_medicines: [],
      urgency: "routine",
      home_care_advice: ["Consult a healthcare provider for proper diagnosis"],
      warning_signs: ["If symptoms worsen, seek immediate medical attention"]
    });

    // Complete the screening session
    const { error: completeError } = await supabase
      .from("screening_sessions")
      .update({
        status: "complete",
        analysis: aiData,
        answers,
        stage: stage + 1,
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq("id", screening_id);

    if (completeError) {
      console.error("Completion error:", completeError);
      return NextResponse.json(
        { status: false, message: "Failed to complete screening" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: true,
      screening_id,
      stage: stage + 1,
      analysis: aiData,
      message: "Health screening completed successfully",
      next_steps: {
        consult_specialist: aiData.recommended_specialties,
        urgency: aiData.urgency,
        lab_tests: aiData.recommended_lab_tests
      }
    });

  } catch (error) {
    console.error("Screening API Error:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "An unexpected error occurred. Please try again.";
    let statusCode = 500;
    
    if (error.message.includes("OpenAI") || error.message.includes("API")) {
      errorMessage = "Our medical analysis service is temporarily unavailable. Please try again in a few moments.";
      statusCode = 503;
    } else if (error.message.includes("database") || error.message.includes("Supabase")) {
      errorMessage = "We're experiencing technical difficulties. Please try again shortly.";
      statusCode = 503;
    }
    
    return NextResponse.json(
      { 
        status: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

// Optional: Add cleanup function for rate limiting
function cleanupRateLimit() {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute
  
  for (const [key, times] of requestCounts.entries()) {
    const filtered = times.filter(time => time > windowStart);
    if (filtered.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, filtered);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimit, 300000);