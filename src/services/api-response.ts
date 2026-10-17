export async function readApiError(response: Response, service: string, technical = false): Promise<Error> {
  const raw = await response.text().catch(() => '');
  let message = '';
  try {
    const data = JSON.parse(raw) as { error?: unknown };
    if (typeof data.error === 'string') message = data.error;
  } catch {
    // Vercel and proxies can return plain-text errors instead of JSON.
  }

  if (!message) {
    if (response.status === 404) message = `${service} is not available in this deployment yet. Redeploy the latest version and try again.`;
    else if (response.status >= 500) message = `${service} had a server error (HTTP ${response.status}). Please try again later.`;
    else message = `${service} could not complete the request (HTTP ${response.status}). Please try again.`;
  }
  const requestId = response.headers.get('x-vercel-id');
  if (technical && requestId) message += ` Request ID: ${requestId}.`;
  return new Error(message);
}

export async function readApiJson<T>(response: Response, service: string, technical = false): Promise<T> {
  const raw = await response.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    const requestId = response.headers.get('x-vercel-id');
    const status = `HTTP ${response.status}`;
    const id = technical && requestId ? ` Request ID: ${requestId}.` : '';
    throw new Error(`${service} returned an unexpected response (${status}). The latest server deployment may be unavailable.${id}`);
  }
}
