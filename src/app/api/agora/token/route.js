import { RtcTokenBuilder, RtcRole } from "agora-token";
import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS() {
  return new Response("OK", { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { appointment_id, uid, role } = await req.json();

    if (!appointment_id || !uid) {
      return NextResponse.json(
        { status: false, message: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      throw new Error("Agora credentials missing in environment");
    }

    const channelName = `appointment_${appointment_id}`;
    const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expireTime = Math.floor(Date.now() / 1000) + 3600; // valid for 1 hour

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      agoraRole,
      expireTime
    );

    return NextResponse.json(
      {
        status: true,
        message: "Agora token generated successfully",
        channelName,
        token,
        appId,
        expireAt: expireTime,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Agora token error:", error);
    return NextResponse.json(
      { status: false, message: error.message || "Failed to generate Agora token" },
      { status: 500, headers: corsHeaders }
    );
  }
}
