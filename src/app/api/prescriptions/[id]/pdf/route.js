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

  const logoUrl =
    process.env.MEDICONNECT_LOGO_URL ||
    "https://placehold.co/200x60?text=Mediconnect";

  const signatureUrl =
    rec.doctor_details?.signature_url ||
    "https://placehold.co/150x50?text=Signature";

  /* -------------------- MEDICINES -------------------- */
  const medicinesRows =
    rec.medicines?.length > 0
      ? rec.medicines
          .map(
            (m, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${m.name || "-"}</td>
            <td>${m.dose || "-"}</td>
            <td>${m.frequency || "-"}</td>
            <td>${m.duration || "-"}</td>
            <td>${m.route || "-"}</td>
            <td>${m.notes || "-"}</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="7" align="center">No medicines prescribed</td></tr>`;

  /* -------------------- LAB TESTS -------------------- */
  const labRows =
    rec.lab_tests?.length > 0
      ? rec.lab_tests
          .map(
            (t, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${t.name || "-"}</td>
            <td>${t.urgency || "-"}</td>
            <td>${t.instructions || "-"}</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="4" align="center">No lab tests advised</td></tr>`;

  /* -------------------- INVESTIGATIONS -------------------- */
  const investigationRows =
    Array.isArray(rec.investigations) && rec.investigations.length
      ? rec.investigations
          .map(
            (inv, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${inv}</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="2" align="center">No investigations advised</td></tr>`;

  /* -------------------- VITAL SIGNS -------------------- */
  const vitalsRows =
    rec.vital_signs && Object.keys(rec.vital_signs).length
      ? Object.entries(rec.vital_signs)
          .map(
            ([k, v]) => `
          <tr>
            <td>${k.replaceAll("_", " ")}</td>
            <td>${v}</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="2" align="center">Not recorded</td></tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@page { size: A4; margin: 10mm; }
body { font-family: Arial, sans-serif; font-size: 12px; color:#000; }
table { width:100%; border-collapse:collapse; margin-bottom:10px; }
th, td { border:1px solid #000; padding:6px; vertical-align:top; }
th { background:#f2f2f2; font-weight:bold; }
.heading { background:#e6f0ff; font-weight:bold; text-align:left; }
.small { font-size:10px; }
.center { text-align:center; }
.right { text-align:right; }
.watermark {
  position:fixed;
  top:40%;
  left:20%;
  font-size:70px;
  color:rgba(0,0,0,0.05);
  transform:rotate(-30deg);
}
</style>
</head>

<body>
<div class="watermark">PRESCRIPTION</div>

<!-- HEADER -->
<table>
  <tr>
    <td width="25%">
      <img src="${logoUrl}" height="50" />
    </td>
    <td class="center">
      <strong>MEDICAL PRESCRIPTION</strong><br/>
      <span class="small">Generated on ${createdAt}</span>
    </td>
    <td width="25%" class="right small">
      Prescription ID: ${rec.pid}
    </td>
  </tr>
</table>

<!-- DOCTOR DETAILS -->
<table>
  <tr><th colspan="4" class="heading">Doctor Details</th></tr>
  <tr>
    <td>Name</td>
    <td>${rec.doctor_details.full_name}</td>
    <td>Qualification</td>
    <td>${rec.doctor_details.qualification || "-"}</td>
  </tr>
  <tr>
    <td>Specialization</td>
    <td>${rec.doctor_details.specialization || "-"}</td>
    <td>License No</td>
    <td>${rec.doctor_details.license_number || "-"}</td>
  </tr>
  <tr>
    <td>Clinic</td>
    <td colspan="3">${rec.doctor_details.clinic_name || "-"}, ${rec.doctor_details.clinic_address || "-"}</td>
  </tr>
</table>

<!-- PATIENT DETAILS -->
<table>
  <tr><th colspan="4" class="heading">Patient Details</th></tr>
  <tr>
    <td>Name</td>
    <td>${rec.patient_details.full_name}</td>
    <td>Gender</td>
    <td>${rec.patient_details.gender || "-"}</td>
  </tr>
  <tr>
    <td>Date of Birth</td>
    <td>${rec.patient_details.date_of_birth || "-"}</td>
    <td>Blood Group</td>
    <td>${rec.patient_details.blood_group || "-"}</td>
  </tr>
  <tr>
    <td>Address</td>
    <td colspan="3">${rec.patient_details.address || "-"}</td>
  </tr>
</table>

<!-- APPOINTMENT DETAILS -->
<table>
  <tr><th colspan="4" class="heading">Consultation Details</th></tr>
  <tr>
    <td>Date</td>
    <td>${appointmentDate}</td>
    <td>Time</td>
    <td>${appointmentTime}</td>
  </tr>
  <tr>
    <td>Mode</td>
    <td>${rec.appointment_type || "-"}</td>
    <td>Status</td>
    <td>${rec.appointments?.status || "-"}</td>
  </tr>
</table>

<!-- DIAGNOSIS -->
<table>
  <tr><th class="heading">Diagnosis</th></tr>
  <tr>
    <td>${rec.diagnosis?.provisional_diagnosis || "-"}</td>
  </tr>
</table>

<!-- VITAL SIGNS -->
<table>
  <tr><th colspan="2" class="heading">Vital Signs</th></tr>
  ${vitalsRows}
</table>

<!-- MEDICINES -->
<table>
  <tr><th colspan="7" class="heading">Prescribed Medicines</th></tr>
  <tr>
    <th>#</th>
    <th>Name</th>
    <th>Dose</th>
    <th>Frequency</th>
    <th>Duration</th>
    <th>Route</th>
    <th>Instructions</th>
  </tr>
  ${medicinesRows}
</table>

<!-- LAB TESTS -->
<table>
  <tr><th colspan="4" class="heading">Laboratory Tests</th></tr>
  <tr>
    <th>#</th>
    <th>Test Name</th>
    <th>Urgency</th>
    <th>Instructions</th>
  </tr>
  ${labRows}
</table>

<!-- INVESTIGATIONS -->
<table>
  <tr><th colspan="2" class="heading">Investigations</th></tr>
  <tr><th>#</th><th>Name</th></tr>
  ${investigationRows}
</table>

<!-- FOLLOW UP -->
<table>
  <tr><th class="heading">Follow Up & Instructions</th></tr>
  <tr>
    <td>
      ${rec.follow_up?.instructions || "Follow up as advised"}
    </td>
  </tr>
</table>

<!-- DOCTOR NOTES -->
${
  rec.special_message
    ? `
<table>
  <tr><th class="heading">Doctor Notes</th></tr>
  <tr><td>${rec.special_message}</td></tr>
</table>`
    : ""
}

<!-- SIGNATURE -->
<table>
  <tr>
    <td width="70%" class="small">
      This prescription is valid only with the doctor’s signature.<br/>
      © ${new Date().getFullYear()} Mediconnect
    </td>
    <td width="30%" class="center">
      <img src="${signatureUrl}" height="40" /><br/>
      <strong>${rec.doctor_details.full_name}</strong><br/>
      <span class="small">${rec.doctor_details.specialization}</span>
    </td>
  </tr>
</table>

</body>
</html>
`;
}
