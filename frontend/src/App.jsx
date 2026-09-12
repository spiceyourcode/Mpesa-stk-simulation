import { useState } from "react";
import { api, saveAuth, clearAuth, getToken } from "./api";
import "./App.css";

function App() {
  const [view, setView] = useState(getToken() ? "pay" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [amount, setAmount] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("254792873281");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);

  const submitAuth = async (e)=> {
    e.preventDefault();
    setAuthMessage("");
    const path = view === "register" ? "/api/auth/register" : "/api/auth/login"; 
    try{
      const {data} = await api.post(path, {email, password }); 
      saveAuth(data.token); 
      setView("pay");
    }catch(error){
      setAuthMessage(error.response?.data?.message || "Auth failed " )
    }
  };

  const logout = () => {
    clearAuth();
    setView("login");
    setPassword("");
  };
  if (view === "login" || view === "register") {
    return (
      <div className="app">
        <h1>{view === "register" ? "Create account" : "Log in"}</h1>
        <form onSubmit={submitAuth}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
          <button type="submit">
            {view === "register" ? "Register" : "Log in"}
          </button>
        </form>
        {authMessage && <p className="error">{authMessage}</p>}
        <button type="button" onClick={() => setView(view === "login" ? "register" : "login")}>
          {view === "login" ? "Need an account?" : "Already have an account?"}
        </button>
      </div>
    );
  }

  const pay = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    setOrder(null);

    try {
      const { data } = await api.post("/api/order", {
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
          const { data: poll } = await api.get(`/api/order/${orderId}`);
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
      if (error.response?.status === 401) {
        clearAuth();
        setView("login");
        setAuthMessage("Please log in again.");
        return;
      }
      setStatus("error");
      setMessage(
        error.response?.data?.message || "Could not start payment."
      );
    }
  };

  return (
    <div className="app">
      <h1>Pay with M-Pesa</h1>
      <button type="button" onClick={logout}>
        Log out
      </button>

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