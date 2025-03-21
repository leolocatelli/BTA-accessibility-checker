export async function GET(request) {
  return new Response("Authentication Required!", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="private_pages"',
    },
  });
}
