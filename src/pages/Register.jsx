import { useState } from 'react';
import { Link } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Registration is not yet connected. Please contact the university for enrollment.');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#f7f6f3] py-12">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="bg-white border border-slate-100 rounded-lg shadow-sm p-8">
          <h1 className="font-serif text-2xl font-semibold text-[#0b2d52] mb-2">Create account</h1>
          <p className="text-slate-600 text-sm mb-6">
            Register for the Najah platform. Use your university email.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00356b]/20 focus:border-[#00356b]"
                placeholder="you@stu.najah.edu"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00356b]/20 focus:border-[#00356b]"
              />
            </div>
            {message && (
              <p className="text-sm text-slate-600">{message}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#00356b] text-white font-semibold hover:bg-[#002a54] transition-colors"
            >
              Register
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#00356b] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
