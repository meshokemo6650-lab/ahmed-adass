/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Mail, Lock, User, Phone, Check, ShieldAlert, Fingerprint, Smile, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  user: UserProfile;
  onLogin: (updatedUser: Partial<UserProfile>) => void;
}

export default function AuthScreen({ user, onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('demo@taskmanager.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  
  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  
  // Error / Status feedback
  const [error, setError] = useState('');
  const [biometricScanning, setBiometricScanning] = useState<'finger' | 'face' | null>(null);

  const isAr = user.language === 'ar';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginEmail || !loginPassword) {
      setError(isAr ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }
    
    // Simulate successful login
    onLogin({
      name: loginEmail === 'demo@taskmanager.com' ? 'أحمد محمد' : loginEmail.split('@')[0],
      email: loginEmail,
      isLoggedIn: true,
    });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setError(isAr ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      setError(isAr ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.');
      return;
    }
    
    if (!agreeTerms) {
      setError(isAr ? 'يجب الموافقة على الشروط والأحكام أولاً.' : 'You must agree to the Terms & Conditions first.');
      return;
    }
    
    // Simulate successful signup and login
    onLogin({
      name: signupName,
      email: signupEmail,
      phone: signupPhone || undefined,
      isLoggedIn: true,
    });
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail) {
      setError(isAr ? 'الرجاء إدخال البريد الإلكتروني.' : 'Please enter your email address.');
      return;
    }
    setForgotSent(true);
  };

  const handleBiometricAuth = (type: 'finger' | 'face') => {
    setBiometricScanning(type);
    setTimeout(() => {
      setBiometricScanning(null);
      // Log in as demo user
      onLogin({
        name: 'أحمد محمد (بصمة)',
        email: 'demo@taskmanager.com',
        isLoggedIn: true,
      });
    }, 1500);
  };

  return (
    <div id="auth-screen" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 transition-all duration-300">
        
        {/* App Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-2xl shadow-lg mb-3">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white font-sans">
            {isAr ? 'منظم المهام اليومية' : 'Daily Task Manager'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login' && (isAr ? 'مرحباً بك مجدداً! نظم حياتك بسهولة.' : 'Welcome back! Organize your life with ease.')}
            {mode === 'signup' && (isAr ? 'أنشئ حسابك وابدأ التخطيط الفعّال اليوم.' : 'Create your account and start effective planning today.')}
            {mode === 'forgot' && (isAr ? 'استعد الوصول إلى حسابك.' : 'Recover access to your account.')}
          </p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm rounded-2xl flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        {/* --- LOGIN MODE --- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2 text-right">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pr-12 pl-4 text-white text-sm outline-none transition-all text-right"
                  placeholder="name@example.com"
                  id="login-email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </button>
                <label className="text-slate-300 text-sm font-medium text-right">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pr-12 pl-4 text-white text-sm outline-none transition-all text-right"
                  placeholder="••••••••"
                  id="login-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] text-white font-medium text-sm rounded-2xl shadow-lg shadow-indigo-500/20 transition-all font-sans"
              id="login-submit-button"
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>

            {/* Third Party Login (Google, Apple) */}
            <div className="relative py-4 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-slate-800/60"></div>
              <span className="relative z-10 bg-slate-900 px-4 text-xs text-slate-500 font-medium">
                {isAr ? 'أو تسجيل الدخول بواسطة' : 'Or sign in with'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onLogin({ name: 'المستخدم التجريبي (جوجل)', email: 'google@demo.com', isLoggedIn: true })}
                className="flex items-center justify-center gap-2 py-3 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800 text-slate-300 text-xs font-semibold rounded-2xl active:scale-[0.98] transition-all"
                id="google-login-button"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => onLogin({ name: 'المستخدم التجريبي (آبل)', email: 'apple@demo.com', isLoggedIn: true })}
                className="flex items-center justify-center gap-2 py-3 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800 text-slate-300 text-xs font-semibold rounded-2xl active:scale-[0.98] transition-all"
                id="apple-login-button"
              >
                <span>Apple</span>
              </button>
            </div>

            {/* Biometric login shortcut */}
            <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-800/60 mt-4">
              <span className="text-xs text-slate-500 mb-3 font-medium">
                {isAr ? 'تسجيل دخول سريع آمن' : 'Secure Quick Access'}
              </span>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleBiometricAuth('finger')}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-950/30 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 transition-all"
                  id="fingerprint-login-button"
                >
                  <Fingerprint className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{isAr ? 'البصمة' : 'Fingerprint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBiometricAuth('face')}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-950/30 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 transition-all"
                  id="faceid-login-button"
                >
                  <Smile className="w-6 h-6" />
                  <span className="text-[10px] font-medium">{isAr ? 'الوجه' : 'Face ID'}</span>
                </button>
              </div>
            </div>

            {/* Link to Signup */}
            <div className="text-center pt-4">
              <span className="text-xs text-slate-400">
                {isAr ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                id="signup-toggle-button"
              >
                {isAr ? 'إنشاء حساب جديد' : 'Create New Account'}
              </button>
            </div>
          </form>
        )}

        {/* --- SIGNUP MODE --- */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1.5 text-right">
                {isAr ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 pr-11 pl-4 text-white text-sm outline-none transition-all text-right"
                  placeholder={isAr ? 'محمد أحمد' : 'John Doe'}
                  id="signup-name-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1.5 text-right">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 pr-11 pl-4 text-white text-sm outline-none transition-all text-right"
                  placeholder="name@example.com"
                  id="signup-email-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-medium mb-1.5 text-right">
                {isAr ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                  <Phone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 pr-11 pl-4 text-white text-sm outline-none transition-all text-right"
                  placeholder="+966 50 000 0000"
                  id="signup-phone-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5 text-right">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 pr-10 pl-3 text-white text-xs outline-none transition-all text-right"
                    placeholder="••••••••"
                    id="signup-password-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5 text-right">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-2.5 pr-10 pl-3 text-white text-xs outline-none transition-all text-right"
                    placeholder="••••••••"
                    id="signup-confirm-password-input"
                  />
                </div>
              </div>
            </div>

            {/* Agree To Terms Checkbox */}
            <div className="flex items-center justify-end gap-2.5 py-1">
              <label htmlFor="agree-terms" className="text-xs text-slate-300 select-none cursor-pointer text-right">
                {isAr ? 'أوافق على الشروط والأحكام وسياسة الخصوصية' : 'I agree to the Terms & Privacy Policy'}
              </label>
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  agreeTerms
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-800 bg-slate-950/50 text-transparent hover:border-indigo-500'
                }`}
                id="terms-checkbox"
              >
                {agreeTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-white font-medium text-sm rounded-2xl shadow-lg shadow-emerald-500/10 transition-all font-sans"
              id="signup-submit-button"
            >
              {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
            </button>

            {/* Link back to Login */}
            <div className="text-center pt-3 border-t border-slate-800/60 mt-4">
              <span className="text-xs text-slate-400">
                {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                id="login-toggle-button"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {/* --- FORGOT PASSWORD MODE --- */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-5">
            {!forgotSent ? (
              <>
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2 text-right">
                    {isAr ? 'أدخل بريدك الإلكتروني لاستلام رابط الاستعادة' : 'Enter your email to receive recovery link'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl py-3 pr-12 pl-4 text-white text-sm outline-none transition-all text-right"
                      placeholder="name@example.com"
                      id="forgot-email-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium text-sm rounded-2xl shadow-lg transition-all"
                  id="forgot-submit-button"
                >
                  {isAr ? 'إرسال رابط استعادة كلمة المرور' : 'Send Recovery Link'}
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isAr ? 'تم إرسال الرابط بنجاح!' : 'Link Sent Successfully!'}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {isAr
                    ? 'لقد أرسلنا بريداً إلكترونياً يحتوي على إرشادات تفصيلية لإعادة تعيين كلمة مرورك.'
                    : 'We have sent an email with detailed instructions to reset your password.'}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setForgotSent(false);
              }}
              className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              id="back-to-login-button"
            >
              {isAr ? (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  <span>العودة لتسجيل الدخول</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Biometric Scanning Overlay Simulation */}
      {biometricScanning && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white animate-fade-in">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center max-w-xs text-center shadow-2xl relative">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
              <div className="p-5 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-full text-white">
                {biometricScanning === 'finger' ? (
                  <Fingerprint className="w-12 h-12 animate-pulse" />
                ) : (
                  <Smile className="w-12 h-12 animate-pulse" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">
              {biometricScanning === 'finger'
                ? (isAr ? 'جاري قراءة البصمة...' : 'Scanning Fingerprint...')
                : (isAr ? 'جاري التعرف على الوجه...' : 'Recognizing Face ID...')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isAr
                ? 'ضع إصبعك على المستشعر أو انظر إلى الكاميرا الأمامية'
                : 'Place your finger on the sensor or look at the front camera'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
