const axios = require("axios");

exports.handler = async function (event) {
  try {

    // 🔹 Webhook verification
    if (event.httpMethod === "GET") {
      const params = event.queryStringParameters;

      if (
        params["hub.mode"] === "subscribe" &&
        params["hub.verify_token"] === process.env.VERIFY_TOKEN
      ) {
        return {
          statusCode: 200,
          body: params["hub.challenge"],
          headers: { "Content-Type": "text/plain" }
        };
      }
      return { statusCode: 403, body: "Forbidden" };
    }

    // 🔹 Incoming messages
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!message) {
        return { statusCode: 200, body: "No message" };
      }

      const from = message.from;
      const text = message.text?.body || "I can only read text messages 😊";

      console.log("Message from:", from, "Text:", text);

      await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: `You said: ${text}` }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      return { statusCode: 200, body: "EVENT_RECEIVED" };
    }

    return { statusCode: 405, body: "Method Not Allowed" };

  } catch (error) {
    console.error("Webhook Error:", error.response?.data || error.message);
    return { statusCode: 500, body: "Server Error" };
  }
};
