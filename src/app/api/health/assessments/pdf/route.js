import { supabase } from "@/lib/supabaseAdmin";
import { success, failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

// Generate PDF from screening details with type "ok"
export async function POST(req) {
  try {
    const { user_id, assessment_id, assessment_type } = await req.json();

    if (!user_id) {
      return failure("User ID is required", "validation_error", 400, {
        headers: corsHeaders,
      });
    }

    // Get health assessments with type "ok"
    const { data: assessments, error: fetchError } = await supabase
      .from("health_assessments")
      .select(
        `
        *,
        heart_health_inputs(*),
        lung_health_inputs(*)
      `
      )
      .eq("user_id", user_id)
      .eq("assessment_type", assessment_type)
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    if (!assessments || assessments.length === 0) {
      return failure("No health assessments found with type 'ok'", "not_found", 404, {
        headers: corsHeaders,
      });
    }

    // If specific assessment_id provided, filter for that assessment
    const targetAssessment = assessment_id 
      ? assessments.find(assessment => assessment.id === assessment_id)
      : assessments[0]; // Get the latest one if no specific ID

    if (!targetAssessment) {
      return failure("Assessment not found", "not_found", 404, {
        headers: corsHeaders,
      });
    }

    // Generate HTML content
    const html = buildScreeningHtml(targetAssessment);

    // Generate PDF using your external API
    const pdfResponse = await fetch(
      "https://argosmob.uk/dhillon/public/api/v1/pdf/generate-pdf",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html }),
      }
    );

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text();
      throw new Error(`PDF service error: ${pdfResponse.status} — ${errText}`);
    }

    const pdfJson = await pdfResponse.json();
    console.log("PDF API result:", pdfJson);

    return success(
      "PDF generated successfully from screening details",
      {
        url: pdfJson.url || "",
        assessment_id: targetAssessment.id,
        success: true,
        message: "Health screening PDF generated successfully."
      },
      200,
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error("PDF Generation Error:", error);
    return failure(
      "Failed to generate PDF. " + error.message,
      "pdf_generation_failed",
      500,
      {
        headers: corsHeaders,
      }
    );
  }
}

// Build HTML for screening report
function buildScreeningHtml(assessment) {
  const { assessment_type, health_score, calculated_age, risk_level, ai_analysis, recommendations, created_at } = assessment;
  
  const inputs = assessment.heart_health_inputs || assessment.lung_health_inputs || {};
  
  const formattedDate = new Date(created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get risk level color class
  const getRiskLevelClass = (level) => {
    switch(level) {
      case 'low': return 'risk-low';
      case 'moderate': return 'risk-moderate';
      case 'high': return 'risk-high';
      case 'critical': return 'risk-critical';
      default: return 'risk-moderate';
    }
  };

  // Get priority class for recommendations
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health Screening Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            margin-top: 10px;
        }
        .card {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 5px solid #667eea;
        }
        .score-section {
            display: flex;
            justify-content: space-around;
            text-align: center;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        .score-item {
            flex: 1;
            padding: 20px;
            min-width: 150px;
        }
        .health-score {
            font-size: 3em;
            font-weight: bold;
            color: #28a745;
        }
        .risk-level {
            font-size: 1.5em;
            font-weight: bold;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
        }
        .risk-low { background: #d4edda; color: #155724; }
        .risk-moderate { background: #fff3cd; color: #856404; }
        .risk-high { background: #f8d7da; color: #721c24; }
        .risk-critical { background: #f5c6cb; color: #721c24; }
        .section-title {
            color: #495057;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.4em;
        }
        .findings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .finding-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .recommendation {
            background: #e7f3ff;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .priority-high { border-left-color: #dc3545; background: #f8d7da; }
        .priority-medium { border-left-color: #ffc107; background: #fff3cd; }
        .priority-low { border-left-color: #28a745; background: #d4edda; }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9em;
            border-top: 1px solid #dee2e6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .card {
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Health Screening Report</h1>
        <div class="subtitle">Comprehensive Health Assessment Results</div>
        <div class="subtitle">Generated on: ${formattedDate}</div>
    </div>

    <div class="card">
        <h2 class="section-title">Assessment Overview</h2>
        <div class="score-section">
            <div class="score-item">
                <div>Health Score</div>
                <div class="health-score">${health_score}/100</div>
            </div>
            <div class="score-item">
                <div>Calculated Age</div>
                <div style="font-size: 2em; font-weight: bold; color: #495057;">${calculated_age} years</div>
            </div>
            <div class="score-item">
                <div>Risk Level</div>
                <div class="risk-level ${getRiskLevelClass(risk_level)}">${risk_level.toUpperCase()}</div>
            </div>
        </div>
    </div>

    <div class="card">
        <h2 class="section-title">Medical Analysis</h2>
        <p>${ai_analysis?.analysis || 'Comprehensive health assessment completed. Review the findings and recommendations below.'}</p>
        
        ${ai_analysis?.key_findings && ai_analysis.key_findings.length > 0 ? `
        <h3 style="color: #495057; margin-top: 25px;">Key Findings</h3>
        <div class="findings-grid">
            ${ai_analysis.key_findings.map(finding => `
                <div class="finding-item">${finding}</div>
            `).join('')}
        </div>
        ` : ''}

        ${ai_analysis?.positive_aspects && ai_analysis.positive_aspects.length > 0 ? `
        <h3 style="color: #495057; margin-top: 25px;">Positive Aspects</h3>
        <ul>
            ${ai_analysis.positive_aspects.map(aspect => `
                <li>${aspect}</li>
            `).join('')}
        </ul>
        ` : ''}

        ${ai_analysis?.improvement_areas && ai_analysis.improvement_areas.length > 0 ? `
        <h3 style="color: #495057; margin-top: 25px;">Areas for Improvement</h3>
        <ul>
            ${ai_analysis.improvement_areas.map(area => `
                <li>${area}</li>
            `).join('')}
        </ul>
        ` : ''}
    </div>

    ${recommendations && recommendations.length > 0 ? `
    <div class="card">
        <h2 class="section-title">Health Recommendations</h2>
        ${recommendations.map(rec => `
            <div class="recommendation ${getPriorityClass(rec.priority)}">
                <h3 style="margin-top: 0;">${rec.title || 'Health Recommendation'}</h3>
                <p><strong>Category:</strong> ${rec.category || 'general'} | <strong>Priority:</strong> ${rec.priority || 'medium'} | <strong>Timeframe:</strong> ${rec.timeframe || 'ongoing'}</p>
                <p>${rec.description || 'Follow these action steps to improve your health.'}</p>
                ${rec.indian_context ? '<p><em>🇮🇳 Specifically tailored for Indian context</em></p>' : ''}
                ${rec.action_steps && rec.action_steps.length > 0 ? `
                <h4>Action Steps:</h4>
                <ul>
                    ${rec.action_steps.map(step => `<li>${step}</li>`).join('')}
                </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="card">
        <h2 class="section-title">Assessment Details</h2>
        <table>
            <tr>
                <th>Assessment Type</th>
                <td>${assessment_type ? assessment_type.toUpperCase() + ' Health Screening' : 'General Health Screening'}</td>
            </tr>
            <tr>
                <th>Assessment Date</th>
                <td>${formattedDate}</td>
            </tr>
            ${Object.keys(inputs).length > 0 ? `
            <tr>
                <th>Health Parameters</th>
                <td>
                    ${Object.entries(inputs).map(([key, value]) => `
                        <strong>${formatKey(key)}:</strong> ${value !== null && value !== undefined ? value : 'N/A'}<br>
                    `).join('')}
                </td>
            </tr>
            ` : ''}
        </table>
    </div>

    <div class="card">
        <h2 class="section-title">Medical Guidance</h2>
        <p><strong>When to seek medical attention:</strong></p>
        <p>${ai_analysis?.medical_attention || 'Consult with a healthcare professional for personalized medical advice and if you experience any persistent symptoms or health concerns.'}</p>
        <p style="margin-top: 15px; font-style: italic;">
            This report is generated based on the information provided and should not replace professional medical consultation. 
            Always consult with qualified healthcare providers for medical concerns.
        </p>
    </div>

    <div class="footer">
        <p>Generated by Health Screening System</p>
        <p>Confidential Health Report - For personal use only</p>
    </div>
</body>
</html>
  `;
}

// Helper function to format object keys for display
function formatKey(key) {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// GET endpoint for information
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return failure("User ID is required", "validation_error", 400, {
        headers: corsHeaders,
      });
    }

    return success(
      "PDF generation endpoint",
      {
        message: "Use POST method to generate PDF from health assessments",
        parameters: {
          user_id: "required",
          assessment_id: "optional (uses latest if not provided)"
        },
        endpoint: "https://argosmob.uk/dhillon/public/api/v1/pdf/generate-pdf"
      },
      200,
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("GET PDF Error:", error);
    return failure(
      "Failed to process PDF request. " + error.message,
      "pdf_request_failed",
      500,
      {
        headers: corsHeaders,
      }
    );
  }
}