import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";
import { analyzeHealthData, generateHealthRecommendations } from "@/lib/openai";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

// Get user's health assessments
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const assessmentType = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;
    const offset = (page - 1) * limit;

    if (!userId) {
      return failure("User ID is required", "validation_error", 400, {
        headers: corsHeaders,
      });
    }

    let query = supabase
      .from("health_assessments")
      .select(`
        *,
        heart_health_inputs(*),
        lung_health_inputs(*)
      `, { count: "exact" })
      .eq("user_id", userId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (assessmentType) {
      query = query.eq("assessment_type", assessmentType);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return success("Health assessments fetched successfully.", {
      assessments: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    }, 200, { headers: corsHeaders });
  } catch (error) {
    console.error("GET Health Assessments Error:", error);
    return failure("Failed to fetch health assessments. " + error.message, "fetch_failed", 500, {
      headers: corsHeaders,
    });
  }
}

// Create new health assessment with AI analysis
export async function POST(req) {
  try {
    const {
      user_id,
      assessment_type,
      inputs,
    } = await req.json();

    if (!user_id || !assessment_type || !inputs) {
      return failure("Missing required fields: user_id, assessment_type, inputs", "validation_error", 400, {
        headers: corsHeaders,
      });
    }

    // Validate assessment type
    if (!['heart', 'lung'].includes(assessment_type)) {
      return failure("Invalid assessment type. Must be 'heart' or 'lung'", "validation_error", 400, {
        headers: corsHeaders,
      });
    }

    // Calculate health score based on assessment type
    let healthScore, calculatedAge, riskLevel, riskFactors;

    if (assessment_type === 'heart') {
      const result = calculateHeartHealth(inputs);
      healthScore = result.healthScore;
      calculatedAge = result.calculatedAge;
      riskLevel = result.riskLevel;
      riskFactors = result.riskFactors;
    } else {
      const result = calculateLungHealth(inputs);
      healthScore = result.healthScore;
      calculatedAge = result.calculatedAge;
      riskLevel = result.riskLevel;
      riskFactors = result.riskFactors;
    }

    // Generate AI analysis and recommendations
    const [aiAnalysis, recommendations] = await Promise.all([
      analyzeHealthData(assessment_type, inputs, healthScore, riskFactors),
      generateHealthRecommendations(assessment_type, inputs, riskFactors)
    ]);

    // Create health assessment record
    const { data: assessment, error: assessmentError } = await supabase
      .from("health_assessments")
      .insert([
        {
          user_id,
          assessment_type,
          health_score: healthScore,
          calculated_age: calculatedAge,
          risk_level: riskLevel,
          ai_analysis: aiAnalysis,
          recommendations: recommendations,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Create specific input record
    const inputTable = assessment_type === 'heart' ? 'heart_health_inputs' : 'lung_health_inputs';
    const { error: inputError } = await supabase
      .from(inputTable)
      .insert([
        {
          assessment_id: assessment.id,
          ...inputs,
          created_at: new Date().toISOString(),
        },
      ]);

    if (inputError) throw inputError;

    // Check and award badges
    await checkAndAwardBadges(user_id, assessment_type, healthScore);

    // Get complete assessment with inputs
    const { data: completeAssessment, error: fetchError } = await supabase
      .from("health_assessments")
      .select(`
        *,
        heart_health_inputs(*),
        lung_health_inputs(*)
      `)
      .eq("id", assessment.id)
      .single();

    if (fetchError) throw fetchError;

    return success("Health assessment created successfully with AI analysis.", completeAssessment, 201, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("POST Health Assessment Error:", error);
    return failure("Failed to create health assessment. " + error.message, "creation_failed", 500, {
      headers: corsHeaders,
    });
  }
}

// Health calculation algorithms
function calculateHeartHealth(inputs) {
  let score = 100;
  const riskFactors = [];
  
  // Age factor
  if (inputs.age > 50) {
    score -= 10;
    if (inputs.age > 60) score -= 5;
  }
  
  // Blood Pressure
  if (inputs.systolic_bp >= 140 || inputs.diastolic_bp >= 90) {
    score -= 20;
    riskFactors.push("High blood pressure");
  } else if (inputs.systolic_bp >= 130 || inputs.diastolic_bp >= 80) {
    score -= 15;
    riskFactors.push("Elevated blood pressure");
  }
  
  // Resting Heart Rate
  if (inputs.resting_heart_rate > 100) {
    score -= 15;
    riskFactors.push("High resting heart rate");
  } else if (inputs.resting_heart_rate > 80) {
    score -= 8;
  }
  
  // Smoking
  if (inputs.smoking_status === 'current') {
    score -= 25;
    riskFactors.push("Smoking");
  } else if (inputs.smoking_status === 'former') {
    score -= 10;
  }
  
  // Physical Activity
  if (inputs.physical_activity_minutes < 150) {
    score -= 10;
    riskFactors.push("Insufficient physical activity");
  }
  
  // BMI calculation
  const bmi = inputs.weight_kg / ((inputs.height_cm/100) ** 2);
  if (bmi >= 30) {
    score -= 15;
    riskFactors.push("Obesity");
  } else if (bmi >= 25) {
    score -= 8;
    riskFactors.push("Overweight");
  }
  
  // Medical History
  if (inputs.diabetes_history) {
    score -= 15;
    riskFactors.push("Diabetes history");
  }
  if (inputs.hypertension_history) {
    score -= 10;
    riskFactors.push("Hypertension history");
  }
  if (inputs.family_cardiac_history) {
    score -= 8;
    riskFactors.push("Family cardiac history");
  }
  
  // Symptoms
  if (inputs.chest_pain) {
    score -= 20;
    riskFactors.push("Chest pain - seek medical attention");
  }
  if (inputs.breathlessness) score -= 10;
  if (inputs.palpitations) score -= 8;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Calculate heart age
  const heartAge = inputs.age + Math.floor((100 - score) / 4);
  
  // Determine risk level
  let riskLevel = 'low';
  if (score < 70) riskLevel = 'moderate';
  if (score < 50) riskLevel = 'high';
  if (score < 30) riskLevel = 'critical';
  
  return {
    healthScore: Math.round(score),
    calculatedAge: heartAge,
    riskLevel,
    riskFactors,
  };
}

function calculateLungHealth(inputs) {
  let score = 100;
  const riskFactors = [];
  
  // Age factor
  if (inputs.age > 50) score -= 10;
  if (inputs.age > 65) score -= 10;
  
  // Smoking
  if (inputs.smoking_status === 'current') {
    score -= 30;
    riskFactors.push("Smoking");
  } else if (inputs.smoking_status === 'former') {
    score -= 15;
  }
  
  // Breath holding test
  if (inputs.breath_holding_time < 20) {
    score -= 25;
    riskFactors.push("Poor lung capacity");
  } else if (inputs.breath_holding_time < 30) {
    score -= 15;
  } else if (inputs.breath_holding_time < 45) {
    score -= 8;
  }
  
  // Breathing rate
  if (inputs.breaths_per_minute > 25) {
    score -= 15;
    riskFactors.push("Rapid breathing");
  } else if (inputs.breaths_per_minute > 20) {
    score -= 8;
  }
  
  // Pollution exposure
  if (inputs.pollution_exposure === 'high') {
    score -= 20;
    riskFactors.push("High pollution exposure");
  } else if (inputs.pollution_exposure === 'moderate') {
    score -= 10;
  }
  
  // Symptoms
  if (inputs.breathlessness === 'severe') {
    score -= 20;
    riskFactors.push("Severe breathlessness");
  } else if (inputs.breathlessness === 'moderate') {
    score -= 12;
  }
  
  if (inputs.cough_frequency === 'constant') {
    score -= 15;
    riskFactors.push("Persistent cough");
  } else if (inputs.cough_frequency === 'daily') {
    score -= 10;
  }
  
  if (inputs.wheezing) {
    score -= 12;
    riskFactors.push("Wheezing");
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Calculate lung age
  const lungAge = inputs.age + Math.floor((100 - score) / 3);
  
  // Determine risk level
  let riskLevel = 'low';
  if (score < 70) riskLevel = 'moderate';
  if (score < 50) riskLevel = 'high';
  if (score < 30) riskLevel = 'critical';
  
  return {
    healthScore: Math.round(score),
    calculatedAge: lungAge,
    riskLevel,
    riskFactors,
  };
}

async function checkAndAwardBadges(userId, assessmentType, score) {
  const badgesToAward = [];
  
  // First assessment badge
  const { count } = await supabase
    .from("health_assessments")
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('assessment_type', assessmentType);
  
  if (count === 1) {
    badgesToAward.push({
      badge_name: `${assessmentType === 'heart' ? 'Heart' : 'Lung'} Health Starter`,
      badge_type: assessmentType,
      description: `Completed first ${assessmentType} health assessment`
    });
  }
  
  // Score-based badges
  if (score >= 80) {
    badgesToAward.push({
      badge_name: `${assessmentType === 'heart' ? 'Heart' : 'Lung'} Champion`,
      badge_type: assessmentType,
      description: `Achieved excellent ${assessmentType} health score`
    });
  }
  
  // Award badges
  for (const badge of badgesToAward) {
    await supabase
      .from("user_badges")
      .insert([{ 
        user_id: userId, 
        ...badge,
        earned_at: new Date().toISOString()
      }]);
  }
}