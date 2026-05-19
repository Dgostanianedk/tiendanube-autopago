const express = require("express");
const app = express();
app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const STORE_ID = process.env.STORE_ID;

async function apiCall(url, method, body) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authentication: `bearer ${ACCESS_TOKEN}`,
      "User-Agent": "AutoPago/1.0",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.json();
}

app.post("/webhook", async (req, res) => {
  try {
    const order = req.body;
    const orderId = order.id;

    console.log(`Nueva orden recibida: ${orderId}`);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const base = `https://api.tiendanube.com/v1/${STORE_ID}/orders/${orderId}`;

    // Marcar la orden como pagada
    const pay = await apiCall(base, "PUT", { status: "paid" });
    console.log(`Respuesta:`, JSON.stringify(pay));

    if (pay.payment_status === "paid") {
      console.log(`✅ Orden ${orderId} marcada como pagada correctamente`);
    } else {
      console.log(`⚠️ Estado: ${pay.payment_status}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("AutoPago Tiendanube funcionando ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
