
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Check existing session first
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setLoading(false); // ✅ already in recovery session
      }
    });

    // 2️⃣ Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          setLoading(false);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async () => {
    if (!password) return;

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
    } else {
     toast.success("Password updated successfully!");
      navigate("/auth");
    }
  };

  if (loading) return <p className="text-white">Verifying recovery link...</p>;

return (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b]">
    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8">
      <h2 className="text-2xl font-semibold text-center mb-2">
        Set New Password
      </h2>

      <p className="text-sm text-gray-500 text-center mb-6">
        Enter your new password below
      </p>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleReset}
        disabled={!password}
        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-md font-medium disabled:opacity-50"
      >
        Update Password
      </button>
    </div>
  </div>
);
}
