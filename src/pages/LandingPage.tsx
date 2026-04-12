import { useState } from 'react';
import { SignIn } from '../components/auth/SignIn';
import { SignUp } from '../components/auth/SignUp';
import { Scale, Shield, Users, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';

export function LandingPage() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Scale className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">Lawyer Connect </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900">
                Features
              </a>
              <a href="#why-join" className="text-slate-600 hover:text-slate-900">
                Why Join
              </a>
              <a href="#help" className="text-slate-600 hover:text-slate-900">
                Help
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Empower Your Legal Practice
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Connect with clients, manage cases efficiently, and grow your legal practice
              with our comprehensive platform designed specifically for lawyers.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Secure client communication',
                'Streamlined case management',
                'Integrated payment system',
                'Real-time case tracking',
              ].map((feature) => (
                <div key={feature} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            {showSignIn ? (
              <SignIn onSwitchToSignUp={() => setShowSignIn(false)} />
            ) : (
              <SignUp onSwitchToSignIn={() => setShowSignIn(true)} />
            )}
          </div>
        </div>

        <div id="features" className="mt-24">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Powerful Features for Modern Lawyers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Secure & Compliant
              </h3>
              <p className="text-slate-600">
                Bank-level encryption for all communications and documents. Full compliance
                with legal data protection requirements.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Client Management</h3>
              <p className="text-slate-600">
                Efficiently manage all your clients, cases, and communications in one
                centralized platform.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Grow Your Practice</h3>
              <p className="text-slate-600">
                Get matched with qualified clients and expand your practice with our
                intelligent matching system.
              </p>
            </div>
          </div>
        </div>

        <div id="why-join" className="mt-24 bg-white rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Why Join Lawyer Connect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                For Experienced Lawyers
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li>• Access to verified clients seeking legal representation</li>
                <li>• Streamlined case management tools</li>
                <li>• Secure document sharing and communication</li>
                <li>• Automated billing and payment collection</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                For Growing Practices
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li>• Expand your client base organically</li>
                <li>• Manage multiple cases simultaneously</li>
                <li>• Track case progress and milestones</li>
                <li>• Professional profile and credibility building</li>
              </ul>
            </div>
          </div>
        </div>

        <div id="help" className="mt-24 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
            <HelpCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Need Help Getting Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Our support team is here to assist you every step of the way
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
                Contact Support
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-white mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="w-6 h-6" />
                <span className="text-lg font-bold">Lawyer Connect </span>
              </div>
              <p className="text-slate-400">
                Professional legal practice management platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2026 Lawyer Connect. All rights reserved.</p>
             <p className="text-slate-400">
                Follow us on  -  lawyerconnect
              </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
