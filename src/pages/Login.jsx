import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const ALLOWED_DOMAINS = ["@stu.najah.edu", "@najah.edu"];

function isValidNajahEmail(email) {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_DOMAINS.some((d) => normalized.endsWith(d.toLowerCase()));
}

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const isAdminLogin = email.trim().toLowerCase() === "admin";

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError("");
      return;
    }
    if (isAdminLogin) {
      setEmailError("");
      return;
    }
    setEmailError(
      isValidNajahEmail(email)
        ? ""
        : "Please use an email ending with @stu.najah.edu or @najah.edu"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!isAdminLogin && !isValidNajahEmail(email)) {
      setEmailError(
        "Please use an email ending with @stu.najah.edu or @najah.edu"
      );
      return;
    }
    setEmailError("");
    if (!password.trim()) {
      setLoginError("Please enter your password.");
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Sign-in failed. Please try again.");
        return;
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch {
      setLoginError("Sign-in failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleError("");
    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGoogleError(data.error || "Sign-in failed. Please try again.");
        return;
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch {
      setGoogleError("Sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError("Google sign-in was cancelled or failed. Please try again.");
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8 md:p-10">
          {/* Academic cap icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9 12 3zm0 2.18l6.9 3.84L12 11.72 5.1 9.02 12 5.18zM5 12.82l2 1.09V17l5 2.73 5-2.73v-3.09l2-1.09V15l-7 3.82-7-3.82v-2.18z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-blue-900 text-center mb-1">
            Sign in to Najah
          </h1>
          <p className="text-gray-500 text-sm text-center mb-8">
            Welcome back! Please enter your academic credentials to access your
            portal.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={handleEmailBlur}
                placeholder="e.g. student@stu.najah.edu or name@najah.edu"
                className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  emailError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1.5 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-sm text-red-600">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 uppercase tracking-wide disabled:opacity-70"
            >
              {formLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-center [&>div]:!w-full [&>div>div]:!w-full [&_iframe]:!w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="320"
                locale="en"
              />
            </div>
            {googleLoading && (
              <p className="text-sm text-gray-500 text-center">Signing you in…</p>
            )}
            <p className="text-center text-xs text-gray-500">
              Only @stu.najah.edu or @najah.edu Google accounts are allowed.
            </p>
            {googleError && (
              <p className="text-sm text-red-600 text-center">{googleError}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
