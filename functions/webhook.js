exports.handler = async (event) => {
  const VERIFY_TOKEN = "my_verify_token";

  // ✅ Verification (GET)
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters;

    if (
      params["hub.mode"] === "subscribe" &&
      params["hub.verify_token"] === VERIFY_TOKEN
    ) {
      return {
        statusCode: 200,
        body: params["hub.challenge"],
      };
    }

    return {
      statusCode: 403,
      body: "Forbidden",
    };
  }

  // ✅ Receive messages (POST)
  if (event.httpMethod === "POST") {
    console.log("Message received:", event.body);

    return {
      statusCode: 200,
      body: "EVENT_RECEIVED",
    };
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};
