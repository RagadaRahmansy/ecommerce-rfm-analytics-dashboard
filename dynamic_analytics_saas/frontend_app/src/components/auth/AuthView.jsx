import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function AuthView({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authError,
  authLoading,
  handleAuthSubmit
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-tr from-primary via-indigo-500 to-secondary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/30 border border-white/20 select-none">
            R
          </div>
          <span className="text-3xl font-extrabold text-on-surface tracking-tight">Ragada <span className="text-primary">Analytics</span></span>
        </div>
        <h2 className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          Next-Generation Enterprise Intelligence & Semantic Studio
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-10 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700/50 transition-all duration-300">
          {authError && (
            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 text-indigo-700 text-sm rounded-r-lg">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleAuthSubmit} className="space-y-6">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Company Name</label>
                <input
                  type="text"
                  required
                  value={authForm.company_name}
                  onChange={(e) => setAuthForm({ ...authForm, company_name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email Address</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50"
            >
              {authLoading ? 'Authenticating...' : authMode === 'login' ? 'Sign In to Workspace' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); }}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
