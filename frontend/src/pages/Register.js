import { registerUser } from "../services/authService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Sending data:", { name, email, password }); // Debugging

    try {
      const response = await registerUser(name, email, password);
      console.log("Response from server:", response.data);

      if (response.data.success) {
        setUser({ role: "parent" });
        navigate("/dashboard/parent");
      } else {
        alert(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold">Register</h2>
      <form
        className="mt-4 bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleRegister}
      >
        <input
          type="text"
          placeholder="Name"
          className="block w-full p-2 border mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="block w-full p-2 border mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="block w-full p-2 border mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
