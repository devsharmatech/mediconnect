import dayjs from "dayjs";

export const buildPrescriptionHtml = (rec) => {
  const now = dayjs(rec.created_at).format("DD MMM YYYY, HH:mm");

  const appointmentDate = rec.appointments?.appointment_date
    ? dayjs(rec.appointments.appointment_date).format("DD MMM YYYY")
    : "N/A";
  const appointmentTime = rec.appointments?.appointment_time || "N/A";

  const logoUrl =
    process.env.NEXT_PUBLIC_MEDICONNECT_LOGO_URL ||
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

  const investigationsList = (rec.investigations || [])
    .map((inv, i) => `<li>${i + 1}. ${inv || "-"}</li>`)
    .join("");

  const aiSummary = rec.ai_analysis
    ? `
      <div class="ai-section">
        <h3>Disease Analysis Summary</h3>
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
      padding: 10mm 5mm 5mm 5mm;
      position: relative;
      box-sizing: border-box;
    }
    
    /* Professional Header */
    .header {
      border-bottom: 3px double #2c5aa0;
      padding-bottom: 10px;
      margin-bottom: 10px;
      position: relative;
    }
    
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    
    .header-table td {
      vertical-align: top;
      padding: 0;
      border: none;
    }
    
    .logo-section img { 
      height: 60px; 
      max-width: 180px;
    }
    
    .prescription-title {
      text-align: center;
    }
    
    .prescription-title h1 {
      color: #2c5aa0;
      margin: 0;
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    
    .prescription-title .subtitle {
      color: #666;
      font-size: 12px;
      margin-top: 2px;
    }
    
    .document-info {
      text-align: right;
      font-size: 10px;
      color: #666;
      width: 120px;
    }
    
    /* Clinic Info Section */
    .clinic-info-section {
      width: 100%;
      border-collapse: collapse;
      background: #f8f9fa;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 11px;
    }
    
    .clinic-info-section td {
      border: none;
      padding: 0;
    }
    
    .clinic-details {
      width: 70%;
    }
    
    .clinic-details .clinic-name {
      font-weight: bold;
      color: #2c5aa0;
      font-size: 14px;
      margin-bottom: 2px;
    }
    
    .doctor-qualification {
      font-size: 10px;
      color: #666;
      font-style: italic;
    }
    
    .consultation-info {
      width: 30%;
      text-align: right;
      border-left: 1px solid #ddd;
      padding-left: 12px;
    }
    
    .consultation-fee {
      font-weight: bold;
      color: #2c5aa0;
    }

    /* Watermark */
    .watermark {
      position: absolute;
      top: 30%;
      left: 15%;
      font-size: 60px;
      color: rgba(44, 90, 160, 0.03);
      transform: rotate(-30deg);
      z-index: 0;
      user-select: none;
      font-weight: bold;
    }

    /* Patient Info */
    .section {
      margin-bottom: 12px;
      z-index: 2;
      position: relative;
      page-break-inside: avoid;
    }
    
    .section h3 {
      border-bottom: 1px solid #2c5aa0;
      padding-bottom: 4px;
      color: #2c5aa0;
      font-size: 13px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Patient Details Table */
    .patient-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    .patient-table td {
      padding: 2px 0;
      vertical-align: top;
      border: none;
    }
    
    .info-group {
      margin-bottom: 6px;
    }
    
    .info-label {
      font-weight: bold;
      color: #555;
      display: inline-block;
      min-width: 90px;
    }

    /* Medicine Tables */
    .medicines-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 11px;
    }
    
    .medicines-table th {
      background-color: #2c5aa0;
      color: white;
      padding: 6px 8px;
      text-align: left;
      font-weight: bold;
      border: none;
    }
    
    .medicines-table td {
      border: 1px solid #ddd;
      padding: 6px 8px;
      vertical-align: top;
    }
    
    .medicines-table tr:nth-child(even) {
      background-color: #f8f9fa;
    }

    /* Lists */
    ul {
      margin: 6px 0;
      padding-left: 18px;
    }
    
    li {
      margin-bottom: 3px;
      font-size: 12px;
    }

    /* AI Section */
    .ai-section {
      background: #f0f7ff;
      padding: 10px 12px;
      margin: 12px 0;
      border-radius: 0 4px 4px 0;
    }
    
    .ai-section h3 {
      color: #2c5aa0;
      margin-top: 0;
    }

    /* Footer with Signature */
    .footer {
      margin-top: 15px;
      border-top: 2px solid #2c5aa0;
      padding-top: 8px;
    }
    
    .footer-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .footer-table td {
      vertical-align: bottom;
      padding: 0;
      border: none;
    }
    
    .footer-left {
      width: 50%;
      font-size: 9px;
      color: #555;
    }
    
    .footer-right {
      width: 50%;
      text-align: right;
      font-size: 9px;
    }
    
    .signature-box {
      text-align: center;
      margin-bottom: 5px;
    }
    
    .signature-box img {
      height: 35px;
      margin-bottom: 2px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 2px;
    }
    
    .doctor-name {
      font-weight: bold;
      color: #2c5aa0;
      font-size: 10px;
    }
    
    .doctor-specialization {
      font-size: 8px;
      color: #666;
    }
    
    .prescription-id {
      font-family: monospace;
      background: #f5f5f5;
      padding: 1px 4px;
      border-radius: 2px;
      font-size: 8px;
    }
.prescription-spc{
font-size: 14px;
}
    @media print {
      .page {
        padding: 5mm 5mm 3mm 5mm;
      }
    }
  </style>
  </head>
  <body>
  <div class="page">
    <div class="watermark">PRESCRIPTION</div>
    
    <!-- Professional Header -->
    <div class="header">
      <table class="header-table">
        <tr>
          <td style="width: 180px;">
            <div class="logo-section">
              <img src="${logoUrl}" alt="Mediconnect Logo" />
            </div>
          </td>
          <td>
            <div class="prescription-title">
              <h1>MEDICAL PRESCRIPTION</h1>
              <div class="subtitle">Confidential Medical Document</div>
            </div>
          </td>
          <td style="width: 120px;">
            <div class="document-info">
              Prescription ID: <span class="prescription-id">${
                rec.pid
              }</span><br/>
               ${now}
            </div>
          </td>
        </tr>
      </table>
      
      <table class="clinic-info-section">
        <tr>
          <td class="clinic-details">
            <div class="clinic-name">${
              rec.doctor_details?.clinic_name || "Medical Clinic"
            }</div>
            <div>${rec.doctor_details?.clinic_address || "Clinic Address"}</div>
            <div class="doctor-qualification">
              ${rec.doctor_details?.qualification || ""} | ${
    rec.doctor_details?.specialization || "General Physician"
  }
            </div>
          </td>
          <td class="consultation-info">
            <div>Consultation Fee: <span class="consultation-fee">Rs ${
              rec.doctor_details?.consultation_fee || 0
            }</span></div>
            <div>License: MED/${
              rec.doctor_details?.license_number || "XXXXX"
            }</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Patient Information -->
    <div class="section">
      <h3>Patient Information</h3>
      <table class="patient-table">
        <tr>
          <td style="width: 50%;">
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
                  ? dayjs(rec.patient_details.date_of_birth).format(
                      "DD MMM YYYY"
                    )
                  : "-"
              }
            </div>
          </td>
          <td style="width: 50%;">
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
          </td>
        </tr>
      </table>
    </div>

    <!-- Appointment Details -->
    <div class="section">
      <h3>Consultation Details</h3>
      <table class="patient-table">
        <tr>
          <td style="width: 50%;">
            <div class="info-group">
              <span class="info-label">Date:</span> ${appointmentDate}
            </div>
            <div class="info-group">
              <span class="info-label">Time:</span> ${appointmentTime}
            </div>
          </td>
          <td style="width: 50%;">
            <div class="info-group">
              <span class="info-label">Status:</span> ${
                rec.appointments?.status || "-"
              }
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Prescribed Medicines -->
    <div class="section">
      <h3>Prescribed Medications</h3>
      <table class="medicines-table">
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

    <!-- Investigations -->
    <div class="section">
      <h3>Recommended Investigations</h3>
      <ul>${
        investigationsList ||
        "<li>No investigations recommended at this time</li>"
      }</ul>
    </div>

    <!-- Doctor's Notes -->
    ${
      rec.special_message
        ? `<div class="section"><h3>Clinical Notes</h3><p class="prescription-spc">${rec.special_message}</p></div>`
        : ""
    }

    ${aiSummary}

    <!-- Professional Footer -->
    <div class="footer">
      <table class="footer-table">
        <tr>
          <td class="footer-left">
            <strong>Mediconnect Healthcare Services</strong><br/>
            © ${new Date().getFullYear()} | Valid only with doctor's signature
          </td>
          <td class="footer-right">
            <div class="signature-box">
              <img src="${signatureUrl}" alt="Doctor's Signature" />
              <div class="doctor-name">${
                rec.doctor_details?.full_name || ""
              }</div>
              <div class="doctor-specialization">
                ${rec.doctor_details?.specialization || "Medical Practitioner"}
              </div>
              <div>License No: MED/${
                rec.doctor_details?.license_number || "XXXXX"
              }</div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
  </body>
  </html>`;
};
