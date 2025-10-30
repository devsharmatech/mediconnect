export const success = (message, data = null, status = 200) =>
  Response.json({ success: true, message, data }, { status });

export const failure = (message, error = null, status = 400) =>
  Response.json({ success: false, message, error }, { status });
