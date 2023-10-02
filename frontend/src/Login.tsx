//a login react component in ts named Login.tsx
import React, { useState } from "react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("abcd1234@gmail.com");
  const [password, setPassword] = useState("12345678");

  const handleLogin = async () => {
    let data = {
      email: email,
      password: password,
    };
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.ok) {
        console.log("Login successful");
      } else {
        console.error(`Failed to login`);
      }
      return response;
    });
  };

  return (
    <div>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
