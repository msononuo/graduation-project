import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

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

  const handleEmailBlur = () => {
    if (!email.trim()) {
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
    if (!isValidNajahEmail(email)) {
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
        if (data.user.must_change_password) {
          navigate("/change-password", { replace: true });
        } else if (data.user.must_complete_profile) {
          navigate("/complete-profile", { replace: true });
        } else if (data.user.role === "admin") {
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

  const handleGoogleError = () => {
    setGoogleError("Google sign-in was cancelled or failed. Please try again.");
    setGoogleLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleError("");
      setGoogleLoading(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setGoogleError(data.error || "Sign-in failed. Please try again.");
          return;
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          if (data.user.must_change_password) navigate("/change-password", { replace: true });
          else if (data.user.must_complete_profile) navigate("/complete-profile", { replace: true });
          else if (data.user.role === "admin") navigate("/admin", { replace: true });
          else navigate("/dashboard", { replace: true });
        }
      } catch {
        setGoogleError("Sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: handleGoogleError,
    flow: "implicit",
    scope: "email profile openid",
  });

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  const isPlaceholder =
    !googleClientId ||
    googleClientId === "000000000000-placeholder.apps.googleusercontent.com" ||
    googleClientId === "your-google-client-id.apps.googleusercontent.com" ||
    googleClientId.includes("your-google-client-id") ||
    googleClientId.includes("placeholder");
  const hasGoogleConfigured = !!googleClientId && !isPlaceholder;
  const handleGoogleClick = () => {
    if (!hasGoogleConfigured) return;
    googleLogin();
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8 md:p-10">
          {/* University logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/uni-logo.png"
              alt="University logo"
              className="h-16 w-auto object-contain"
            />
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
                <span className="text-sm text-gray-500">Forgot password? Contact admin to reset.</span>
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
            {hasGoogleConfigured ? (
              <>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="w-full py-3 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {googleLoading ? "Signing you in…" : "Continue with Google"}
                </button>
                <p className="text-center text-xs text-gray-500">
                  Only @stu.najah.edu or @najah.edu Google accounts are allowed.
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-medium">Google sign-in is not configured.</p>
                <p className="mt-1">
                  Add your Google Client ID to the <code className="rounded bg-amber-100 px-1">.env</code> file as{" "}
                  <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_CLIENT_ID</code>. See{" "}
                  <code className="rounded bg-amber-100 px-1">GOOGLE-SETUP.md</code> in the project for step-by-step instructions.
                </p>
              </div>
            )}
            {googleLoading && (
              <p className="text-sm text-gray-500 text-center">Signing you in…</p>
            )}
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
