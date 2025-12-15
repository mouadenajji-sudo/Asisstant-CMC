const axios = require("axios");

exports.handler = async function(event, context) {
  try {
    // ---- GET request: verification ----
    if (event.httpMethod === "GET") {
      const VERIFY_TOKEN = "my_verify_token"; // <-- change this to your token
      const params = event.queryStringParameters;

      if (params && params["hub.mode"] === "subscribe" && params["hub.verify_token"] === VERIFY_TOKEN) {
        // WhatsApp expects **plain text**, not JSON
        return {
          statusCode: 200,
          body: params["hub.challenge"],
          headers: {
            "Content-Type": "text/plain"
          }
        };
      } else {
        return { statusCode: 403, body: "Forbidden" };
      }
    }

    // ---- POST request: incoming messages ----
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        const from = message.from;
        const text = message.text?.body;

        console.log("Message from:", from, "Text:", text);

        // Send reply
        await axios.post(
          `https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages`,
          {
            messaging_product: "whatsapp",
            to: from,
            text: { body: `You said: ${text}` },
          },
          {
            headers: {
              Authorization: `Bearer YOUR_ACCESS_TOKEN`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return { statusCode: 200, body: "EVENT_RECEIVED" };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server Error" };
  }
};
