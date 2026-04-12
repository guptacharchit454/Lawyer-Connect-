import { useState } from 'react';
import {
  Search,
  HelpCircle,
  Book,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: 'Verification',
      question: 'How do I verify my Bar Council enrollment number?',
      answer:
        'Your enrollment number will be automatically verified against the Bar Council registry. If automatic verification fails, our team will manually review your documents within 24-48 hours.',
    },
    {
      category: 'Cases',
      question: 'How do I accept or reject case requests?',
      answer:
        'Navigate to the Cases section from your dashboard. Pending requests will be highlighted. Click on any case to view details and use the Accept or Reject buttons to respond to the request.',
    },
    {
      category: 'Cases',
      question: 'How do I update case progress?',
      answer:
        'Open the case details page and scroll to the Case Timeline section. Click the "Add Update" button to create a new milestone or progress update. This will notify your client automatically.',
    },
    {
      category: 'Communication',
      question: 'How do I start a video call with my client?',
      answer:
        'Go to the Messages section, select the case conversation, and click the video call icon in the top right. Your client will receive a notification to join the call.',
    },
    {
      category: 'Communication',
      question: 'Are my messages encrypted?',
      answer:
        'Yes, all communications are end-to-end encrypted using AES-256 encryption. Only you and your client can read the messages.',
    },
    {
      category: 'Payments',
      question: 'How do I set or update my fee structure?',
      answer:
        'Go to Settings > Profile and scroll to the Fee Structure section. You can set different rates for consultation, hourly, and case-based fees. These will be displayed to potential clients.',
    },
    {
      category: 'Payments',
      question: 'When will I receive payment for a case?',
      answer:
        'Payments are processed through Razorpay. Once a client makes a payment, it will be reflected in your Payments dashboard. Settlement to your bank account typically takes 2-3 business days.',
    },
    {
      category: 'Documents',
      question: 'What types of documents can I upload?',
      answer:
        'You can upload PDF, DOC, DOCX, JPG, and PNG files up to 10MB each. Supported document types include petitions, evidence, court orders, and other case-related files.',
    },
    {
      category: 'Profile',
      question: 'How do I update my availability schedule?',
      answer:
        'Navigate to Settings > Availability. You can set your weekly schedule by day and time slots. You can also mark specific dates as blocked for holidays or leaves.',
    },
    {
      category: 'Account',
      question: 'What if I forget my password?',
      answer:
        'Click on "Forgot Password" on the login page. Enter your registered email address and you will receive a password reset link.',
    },
  ];

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-600 mt-1">Find answers and get assistance</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Call Support</h3>
          <p className="text-slate-600 mb-4">Speak with our support team</p>
          <p className="text-blue-600 font-medium">+91 1800-123-4567</p>
          <p className="text-sm text-slate-500">Mon-Fri, 9AM-6PM IST</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Live Chat</h3>
          <p className="text-slate-600 mb-4">Chat with our support team</p>
          <button className="text-green-600 font-medium hover:text-green-700">
            Start Chat
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Email Support</h3>
          <p className="text-slate-600 mb-4">Send us an email</p>
          <p className="text-purple-600 font-medium">support@legalconnect.com</p>
          <p className="text-sm text-slate-500">Response within 24 hours</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <HelpCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        {categories.map((category) => {
          const categoryFAQs = filteredFAQs.filter((faq) => faq.category === category);
          if (categoryFAQs.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <Book className="w-5 h-5 text-blue-600" />
                <span>{category}</span>
              </h3>
              <div className="space-y-3">
                {categoryFAQs.map((faq) => {
                  const globalIndex = faqs.indexOf(faq);
                  const isExpanded = expandedFAQ === globalIndex;

                  return (
                    <div
                      key={globalIndex}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedFAQ(isExpanded ? null : globalIndex)
                        }
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-left font-medium text-slate-900">
                          {faq.question}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                          <p className="text-slate-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No results found for "{searchQuery}"</p>
            <p className="text-sm text-slate-400 mt-2">
              Try different keywords or contact support
            </p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
        <p className="mb-6 opacity-90">
          Our support team is ready to assist you with any questions or issues
        </p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50">
          Contact Support Team
        </button>
      </div>
    </div>
  );
}
