import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    localStorage.setItem("access_token", token);

    (async () => {
      try {
        await checkAuth(); // updates AuthContext
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    })();
  }, []);

  return <div>Signing in...</div>;
}