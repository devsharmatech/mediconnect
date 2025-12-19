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
          license_number,
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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Prescription PDF generated successfully.",
        url: pdfJson.url || "", // ← FIXED
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
  const createdAt = dayjs(rec.created_at).format("DD MMM YYYY, hh:mm A");

  const appointmentDate = rec.appointments?.appointment_date
    ? dayjs(rec.appointments.appointment_date).format("DD MMM YYYY")
    : "N/A";

  const appointmentTime = rec.appointments?.appointment_time || "N/A";

  const logoUrl = process.env.MEDICONNECT_LOGO_URL || "https://mediconnect-lemon.vercel.app/logo.png";
  const doctorIcon = "https://mediconnect-lemon.vercel.app/dr.png";

  /* ---------------- MEDICINES ---------------- */
  const medicinesHtml = rec.medicines?.length
    ? rec.medicines
        .map(
          (m, i) => `
<div class="field">
  ${i + 1}. <span class="value">${m.name}</span> — 
  ${m.dose}, ${m.frequency}, ${m.duration}<br/>
  <small>${m.notes || ""}</small>
</div>`
        )
        .join("")
    : `<div class="field">No medicines prescribed</div>`;

  /* ---------------- LAB TESTS ---------------- */
  const labTestsHtml = rec.lab_tests?.length
    ? rec.lab_tests
        .map(
          (t, i) => `
<div class="field">
  ${i + 1}. <span class="value">${t.name}</span>
  (${t.urgency}) — ${t.instructions || "-"}
</div>`
        )
        .join("")
    : `<div class="field">No lab tests advised</div>`;

  /* ---------------- INVESTIGATIONS ---------------- */
  const investigationsHtml =
    rec.investigations?.requested?.length
      ? rec.investigations.requested
          .map(
            (inv, i) => `
<div class="field">${i + 1}. <span class="value">${inv}</span></div>`
          )
          .join("")
      : `<div class="field">No investigations advised</div>`;

  /* ---------------- VITAL SIGNS ---------------- */
  const vitalsHtml = rec.vital_signs
    ? Object.entries(rec.vital_signs)
        .map(
          ([k, v]) => `
<div class="field">${k.replaceAll("_", " ")}: <span class="value">${v}</span></div>`
        )
        .join("")
    : `<div class="field">Not recorded</div>`;

  /* ---------------- WARNING SIGNS ---------------- */
  const warningSignsHtml = rec.follow_up?.warning_signs?.length
    ? rec.follow_up.warning_signs.join(", ")
    : "—";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Medical Prescription</title>

<style>
@page { size: 297mm 420mm; margin: 20mm; }

body {
  margin: 0;
  font-family: DejaVu Sans, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  color: #000;
}

table { width:100%; border-collapse:collapse; }
.page { width:100%; }

.header { background:#6fbdf2; }
.header td { padding:18px; }

.title { text-align:center; }
.title h1 { margin:0; font-size:34px; font-weight:800; }
.title p { margin:4px 0; font-size:16px; }

.top-info {
  background:#eef6ff;
  font-weight:600;
}
.top-info td { padding:12px; }

h3 {
  font-size:18px;
  margin:22px 0 10px;
  padding-bottom:6px;
  border-bottom:2px solid #000;
  text-transform:uppercase;
}

h4 {
  font-size:16px;
  margin:18px 0 8px;
  padding-left:10px;
  border-left:4px solid #2a8fd6;
}

.field {
  padding:8px 0;
  border-bottom:1px dotted #bbb;
}

.value { color:#0b5ea8; font-weight:600; }

.badge {
  background:#6fbdf2;
  font-size:17px;
  font-weight:800;
  text-align:center;
  padding:14px;
  margin:18px 0;
}

.two-col td {
  width:50%;
  vertical-align:top;
  padding:20px;
}

.warning { color:#c00000; font-weight:700; }

.logo-box img {
  width:90px;
  height:90px;
  border-radius:50%;
  background:#000;
}

.medical-cross img { width:90px; height:90px; border-radius:50%;}
</style>
</head>

<body>
<div class="page">

<!-- HEADER -->
<table class="header">
<tr>
  <td width="20%">
    <div class="logo-box"><img src="${logoUrl}"></div>
  </td>
  <td width="60%" class="title">
    <h1>MediConnect.fit</h1>
    <p>Medical Prescription</p>
    <p>📧 hello@mediconnect.fit</p>
  </td>
  <td width="20%" align="right">
    <div class="medical-cross"><img src="${doctorIcon}"></div>
  </td>
</tr>
</table>

<!-- TOP INFO -->
<table class="top-info">
<tr>
  <td>Prescription ID: <span class="value">${rec.pid}</span></td>
  <td align="right">Date: <span class="value">${createdAt}</span></td>
</tr>
</table>

<!-- BODY -->
<table class="two-col">
<tr>

<!-- LEFT -->
<td>
<h3>Doctor Details</h3>
<div class="field">Name: <span class="value">${rec.doctor_details.full_name}</span></div>
<div class="field">Qualification: <span class="value">${rec.doctor_details.qualification}</span></div>
<div class="field">Specialization: <span class="value">${rec.doctor_details.specialization}</span></div>
<div class="field">License No: <span class="value">${rec.doctor_details.license_number}</span></div>
<div class="field">Clinic: <span class="value">${rec.doctor_details.clinic_name}, ${rec.doctor_details.clinic_address}</span></div>

<h3>Diagnosis</h3>
<div class="field"><span class="value">${rec.diagnosis?.provisional_diagnosis}</span></div>

<h4>Vital Signs</h4>
${vitalsHtml}

<h4>Investigations</h4>
${investigationsHtml}

</td>

<!-- RIGHT -->
<td>
<h3>Patient Details</h3>
<div class="field">Name: <span class="value">${rec.patient_details.full_name}</span></div>
<div class="field">Gender: <span class="value">${rec.patient_details.gender}</span></div>
<div class="field">DOB: <span class="value">${rec.patient_details.date_of_birth}</span></div>
<div class="field">Address: <span class="value">${rec.patient_details.address}</span></div>

<div class="badge">PRESCRIPTION</div>

<h3>Medicines</h3>
${medicinesHtml}

<h3>Lab Tests</h3>
${labTestsHtml}

<h3>Follow Up</h3>
<div class="field">Return After: <span class="value">${rec.follow_up?.return_after || "-"}</span></div>
<div class="field"><span class="warning">Warning Signs:</span> ${warningSignsHtml}</div>

<h3>Digital Signature</h3>
<div class="field">Signed by: <span class="value">${rec.doctor_details.full_name}</span></div>
<div class="field">Signed at: <span class="value">${dayjs(rec.signed_at).format("DD MMM YYYY, hh:mm A")}</span></div>

</td>

</tr>
</table>

</div>
</body>
</html>
`;
}

