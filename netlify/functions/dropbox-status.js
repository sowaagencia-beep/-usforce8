// netlify/functions/dropbox-status.js
exports.handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    configured: !!process.env.DROPBOX_REFRESH_TOKEN,
    hasKey:     !!process.env.DROPBOX_APP_KEY,
  }),
});
