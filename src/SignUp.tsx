import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignUp() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.target);
    formData.set("flow", flow);
    
    try {
      await signIn("password", formData);
      toast.success(flow === "signUp" ? "Sign up successful!" : "Sign in successful!");
    } catch (error) {
      let toastTitle = "";
      if (error.message.includes("Invalid password")) {
        toastTitle = "Invalid password. Please try again.";
      } else {
        toastTitle =
          flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?";
      }
      toast.error(toastTitle);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {flow === "signUp" ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-600">
            {flow === "signUp" 
              ? "Join our lifesaving community" 
              : "Sign in to continue saving lives"}
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {flow === "signUp" && (
            <input
              className="auth-input-field"
              type="text"
              name="name"
              placeholder="Full Name"
              required
            />
          )}
          <input
            className="auth-input-field"
            type="email"
            name="email"
            placeholder="Email Address"
            required
          />
          <input
            className="auth-input-field"
            type="password"
            name="password"
            placeholder="Password"
            required
            minLength={6}
          />
          <button 
            className="auth-button" 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? "Processing..." : flow === "signUp" ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          <span>
            {flow === "signUp" 
              ? "Already have an account? " 
              : "Don't have an account? "}
          </span>
          <button
            type="button"
            className="text-red-600 hover:text-red-700 hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
