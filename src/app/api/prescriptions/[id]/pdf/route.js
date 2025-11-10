import { supabase } from "@/lib/supabaseAdmin";
import { failure } from "@/lib/response";
import { corsHeaders } from "@/lib/cors";

import dayjs from "dayjs";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const { data: rec, error } = await supabase
      .from("prescriptions")
      .select(
        `
        *,
        doctor_details:doctor_id (
          id,
          full_name,
          email,
          specialization,
          qualification,
          clinic_name,
          clinic_address,
          consultation_fee,
          rating,
          signature_url
        ),
        patient_details:patient_id (
          id,
          full_name,
          email,
          gender,
          date_of_birth,
          blood_group,
          address
        ),
        appointments:appointment_id (
          id,
          appointment_date,
          appointment_time,
          status,
          disease_info
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !rec) throw new Error("Prescription not found.");

    const html = buildPrescriptionHtml(rec);

    const pdfResponse = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "X-API-Key": `${process.env.PDFSHIFT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: html,
        use_print: false,
        landscape: false,
        margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" },
      }),
    });

    if (!pdfResponse.ok) {
      const errText = await pdfResponse.text();
      throw new Error(`PDF service error: ${pdfResponse.status} — ${errText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    await supabase.storage
      .from("prescriptions")
      .upload(`pdfs/${id}.pdf`, new Blob([pdfBuffer]), {
        contentType: "application/pdf",
        upsert: true,
      });

    const { data: publicUrlData } = supabase.storage
      .from("prescriptions")
      .getPublicUrl(`pdfs/${id}.pdf`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Prescription PDF generated successfully.",
        url: publicUrlData.publicUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("PDF generation error:", error);
    return failure("Failed to generate PDF.", error.message, 500, {
      headers: corsHeaders,
    });
  }
}

function buildPrescriptionHtml(rec) {
  const now = dayjs(rec.created_at).format("DD MMM YYYY, HH:mm");

  const appointmentDate = rec.appointments?.appointment_date
    ? dayjs(rec.appointments.appointment_date).format("DD MMM YYYY")
    : "N/A";
  const appointmentTime = rec.appointments?.appointment_time || "N/A";

  const logoUrl =
    process.env.MEDICONNECT_LOGO_URL ||
    "https://placehold.co/200x60?text=Mediconnect";
  const signatureUrl =
    rec.doctor_details?.signature_url ||
    "https://placehold.co/200x60?text=Doctor+Signature";

  const medicinesList = (rec.medicines || [])
    .map(
      (m, i) =>
        `<tr>
          <td>${i + 1}</td>
          <td>${m.name || "-"}</td>
          <td>${m.dose || "-"}</td>
          <td>${m.notes || ""}</td>
        </tr>`
    )
    .join("");

  const labList = (rec.lab_tests || [])
    .map((t, i) => `<li>${i + 1}. ${t.name || "-"}</li>`)
    .join("");

  const aiSummary = rec.ai_analysis
    ? `
      <div class="ai-section">
        <h3>AI Analysis Summary</h3>
        <p><strong>Summary:</strong> ${rec.ai_analysis.summary || "N/A"}</p>
        <p><strong>Probable Diagnoses:</strong></p>
        <ul>
          ${(rec.ai_analysis.probable_diagnoses || [])
            .map(
              (d) =>
                `<li>${d.name} — <em>Confidence:</em> ${(
                  d.confidence * 100
                ).toFixed(1)}%</li>`
            )
            .join("")}
        </ul>
      </div>`
    : "";

  return `
  <html>
  <head>
  <style>
    @page { size: A4; margin: 0; }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      margin: 0;
      color: #333;
      position: relative;
      line-height: 1.4;
    }
    .page {
      padding: 20mm 20mm 25mm 20mm;
      position: relative;
      box-sizing: border-box;
    }
    
    /* Professional Header */
    .header {
      border-bottom: 3px double #2c5aa0;
      padding-bottom: 15px;
      margin-bottom: 25px;
      position: relative;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    .logo-section img { 
      height: 65px; 
      max-width: 200px;
    }
    .prescription-title {
      text-align: center;
      flex-grow: 1;
    }
    .prescription-title h1 {
      color: #2c5aa0;
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .prescription-title .subtitle {
      color: #666;
      font-size: 14px;
      margin-top: 2px;
    }
    .document-info {
      text-align: right;
      font-size: 11px;
      color: #666;
      min-width: 120px;
    }
    
    /* Clinic Info Section */
    .clinic-info-section {
      display: flex;
      justify-content: space-between;
      background: #f8f9fa;
      padding: 12px 15px;
      border-radius: 4px;
      border-left: 4px solid #2c5aa0;
      font-size: 12px;
    }
    .clinic-details {
      flex: 2;
    }
    .clinic-details .clinic-name {
      font-weight: bold;
      color: #2c5aa0;
      font-size: 16px;
      margin-bottom: 4px;
    }
    .doctor-qualification {
      font-size: 11px;
      color: #666;
      font-style: italic;
    }
    .consultation-info {
      flex: 1;
      text-align: right;
      border-left: 1px solid #ddd;
      padding-left: 15px;
    }
    .consultation-fee {
      font-weight: bold;
      color: #2c5aa0;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 35%;
      left: 15%;
      font-size: 70px;
      color: rgba(44, 90, 160, 0.03);
      transform: rotate(-30deg);
      z-index: 0;
      user-select: none;
      font-weight: bold;
    }

    /* Patient Info */
    .section {
      margin-bottom: 20px;
      z-index: 2;
      position: relative;
      page-break-inside: avoid;
    }
    .section h3 {
      border-bottom: 1px solid #2c5aa0;
      padding-bottom: 6px;
      color: #2c5aa0;
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Patient Details Grid */
    .patient-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      font-size: 13px;
    }
    .info-group {
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      color: #555;
      display: inline-block;
      min-width: 100px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    table th {
      background-color: #2c5aa0;
      color: white;
      padding: 8px 10px;
      text-align: left;
      font-weight: bold;
    }
    table td {
      border: 1px solid #ddd;
      padding: 8px 10px;
      vertical-align: top;
    }
    table tr:nth-child(even) {
      background-color: #f8f9fa;
    }

    /* Lists */
    ul {
      margin: 8px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
      font-size: 13px;
    }

    /* AI Section */
    .ai-section {
      background: #f0f7ff;
      border-left: 4px solid #2c5aa0;
      padding: 12px 15px;
      margin: 15px 0;
      border-radius: 0 4px 4px 0;
    }
    .ai-section h3 {
      color: #2c5aa0;
      margin-top: 0;
    }

    /* Footer with Signature */
    .footer {
      margin-top: 30px;
      border-top: 2px solid #2c5aa0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #555;
    }
    .footer-left {
      flex: 1;
    }
    .footer-right {
      flex: 1;
      text-align: right;
    }
    .signature-box {
      text-align: center;
      margin-bottom: 10px;
    }
    .signature-box img {
      height: 50px;
      margin-bottom: 5px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
    }
    .doctor-name {
      font-weight: bold;
      color: #2c5aa0;
      font-size: 13px;
    }
    .doctor-specialization {
      font-size: 11px;
      color: #666;
    }
    .prescription-id {
      font-family: monospace;
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
    }

    @media print {
      .page {
        padding: 15mm 15mm 20mm 15mm;
      }
    }
  </style>
  </head>
  <body>
  <div class="page">
    <div class="watermark">PRESCRIPTION</div>
    
    <!-- Professional Header -->
    <div class="header">
      <div class="header-top">
        <div class="logo-section">
          <img src="${logoUrl}" alt="Mediconnect Logo" />
        </div>
        <div class="prescription-title">
          <h1>MEDICAL PRESCRIPTION</h1>
          <div class="subtitle">Confidential Medical Document</div>
        </div>
        <div class="document-info">
          Document ID: <span class="prescription-id">${rec.id}</span><br/>
          Generated: ${now}
        </div>
      </div>
      
      <div class="clinic-info-section">
        <div class="clinic-details">
          <div class="clinic-name">${
            rec.doctor_details?.clinic_name || "Medical Clinic"
          }</div>
          <div>${rec.doctor_details?.clinic_address || "Clinic Address"}</div>
          <div class="doctor-qualification">
            ${rec.doctor_details?.qualification || ""} | ${
    rec.doctor_details?.specialization || "General Physician"
  }
          </div>
        </div>
        <div class="consultation-info">
          <div>Consultation Fee: <span class="consultation-fee">₹${
            rec.doctor_details?.consultation_fee || 0
          }</span></div>
          <div>License: MED/${rec.doctor_details?.id || "XXXXX"}</div>
        </div>
      </div>
    </div>

    <!-- Patient Information -->
    <div class="section">
      <h3>Patient Information</h3>
      <div class="patient-grid">
        <div>
          <div class="info-group">
            <span class="info-label">Name:</span> ${
              rec.patient_details?.full_name || "-"
            }
          </div>
          <div class="info-group">
            <span class="info-label">Gender:</span> ${
              rec.patient_details?.gender || "-"
            }
          </div>
          <div class="info-group">
            <span class="info-label">Date of Birth:</span> ${
              rec.patient_details?.date_of_birth
                ? dayjs(rec.patient_details.date_of_birth).format("DD MMM YYYY")
                : "-"
            }
          </div>
        </div>
        <div>
          <div class="info-group">
            <span class="info-label">Blood Group:</span> ${
              rec.patient_details?.blood_group || "-"
            }
          </div>
          <div class="info-group">
            <span class="info-label">Contact:</span> ${
              rec.patient_details?.email || "-"
            }
          </div>
          <div class="info-group">
            <span class="info-label">Address:</span> ${
              rec.patient_details?.address || "-"
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details -->
    <div class="section">
      <h3>Consultation Details</h3>
      <div class="patient-grid">
        <div>
          <div class="info-group">
            <span class="info-label">Date:</span> ${appointmentDate}
          </div>
          <div class="info-group">
            <span class="info-label">Time:</span> ${appointmentTime}
          </div>
        </div>
        <div>
          <div class="info-group">
            <span class="info-label">Status:</span> ${
              rec.appointments?.status || "-"
            }
          </div>
          <div class="info-group">
            <span class="info-label">Condition:</span> ${
              rec.appointments?.disease_info || "Not specified"
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Prescribed Medicines -->
    <div class="section">
      <h3>Prescribed Medications</h3>
      <table>
        <thead>
          <tr>
            <th width="5%">#</th>
            <th width="35%">Medicine Name</th>
            <th width="25%">Dosage</th>
            <th width="35%">Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${
            medicinesList ||
            "<tr><td colspan='4' style='text-align: center;'>No medications prescribed</td></tr>"
          }
        </tbody>
      </table>
    </div>

    <!-- Lab Tests -->
    <div class="section">
      <h3>Recommended Laboratory Tests</h3>
      <ul>${
        labList || "<li>No laboratory tests recommended at this time</li>"
      }</ul>
    </div>

    <!-- Doctor's Notes -->
    ${
      rec.special_message
        ? `<div class="section"><h3>Clinical Notes</h3><p>${rec.special_message}</p></div>`
        : ""
    }

    <!-- AI Analysis -->
    ${aiSummary}

    <!-- Professional Footer -->
    <div class="footer">
      <div class="footer-left">
        <strong>Mediconnect Healthcare Services</strong><br/>
        Electronic Prescription System<br/>
        © ${new Date().getFullYear()} | Valid only with doctor's signature
      </div>
      <div class="footer-right">
        <div class="signature-box">
          <img src="${signatureUrl}" alt="Doctor's Signature" />
          <div class="doctor-name">${
            rec.doctor_details?.full_name || ""
          }</div>
          <div class="doctor-specialization">
            ${rec.doctor_details?.specialization || "Medical Practitioner"}
          </div>
          <div>License No: MED/${rec.doctor_details?.id || "XXXXX"}</div>
        </div>
      </div>
    </div>
  </div>
  </body>
  </html>`;
}
