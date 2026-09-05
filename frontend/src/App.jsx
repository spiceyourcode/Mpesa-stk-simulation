import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [amount, setAmount] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("254792873281");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);

  const pay = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    setOrder(null);

    try {
      const { data } = await axios.post("/api/order", {
        amount: Number(amount),
        phoneNumber,
      });

      const orderId = data.order.id;
      setOrder(data.order);
      setStatus("pending");
      setMessage("Enter your M-Pesa PIN on your phone.");

      const started = Date.now();
      const timer = setInterval(async () => {
        try {
          const { data: poll } = await axios.get(`/api/order/${orderId}`);
          const current = poll.order;
          setOrder(current);

          if (current.status === "PAID") {
            clearInterval(timer);
            setStatus("paid");
            setMessage("Payment received.");
          } else if (current.status === "FAILED") {
            clearInterval(timer);
            setStatus("failed");
            setMessage(current.result_description || "Payment failed.");
          } else if (Date.now() - started > 90000) {
            clearInterval(timer);
            setStatus("timeout");
            setMessage("Still waiting. Check your phone, then refresh.");
          }
        } catch {
          clearInterval(timer);
          setStatus("error");
          setMessage("Could not check payment status.");
        }
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message || "Could not start payment."
      );
    }
  };

  return (
    <div className="app">
      <h1>Pay with M-Pesa</h1>

      <form onSubmit={pay}>
        <label>
          Amount
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Phone (2547XXXXXXXX)
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="254712345678"
            required
          />
        </label>

        <button type="submit" disabled={status === "submitting" || status === "pending"}>
          {status === "submitting" ? "Sending..." : "Pay"}
        </button>
      </form>

      {message && <p className={status === "paid" ? "success" : "error"}>{message}</p>}

      {order && (
        <p>
          Order #{order.id} — {order.status}
          {order.mpesa_receipt ? ` — ${order.mpesa_receipt}` : ""}
        </p>
      )}
    </div>
  );
}

export default App;