import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-[#e8e2d5] font-sans selection:bg-[#C9A84C] selection:text-black">
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-16 py-5 bg-black/60 backdrop-blur-xl border-b border-[rgba(201,168,76,0.15)]">
        <Link className="flex items-center gap-3 no-underline" href="/">
          <Image src="/app_logo.png" alt="Safar Logo" width={40} height={40} className="h-10 w-auto" style={{ width: 'auto' }} />
          <span className="font-playfair text-2xl font-bold tracking-[0.3em] text-[#C9A84C]">SAFAR</span>
        </Link>
        <Link className="border border-[rgba(201,168,76,0.15)] text-white px-5 py-2 rounded-full font-medium flex items-center gap-2 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all text-xs tracking-wider" href="/">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[rgba(201,168,76,0.15)] rounded-lg flex items-center justify-center text-[#C9A84C]">
            <FileText size={20} />
          </div>
          <p className="text-xs tracking-[0.35em] uppercase text-[#C9A84C] font-semibold">User Agreement</p>
        </div>

        <h1 className="font-playfair text-4xl md:text-5xl font-black mb-2 text-white">Terms of Service</h1>
        <p className="text-xs text-[#6b6560] tracking-widest uppercase mb-12">Last Updated: June 11, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-[#a8a295]">
          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By downloading, installing, or using the Safar mobile application and web services, you agree to comply with and be bound by 
              these Terms of Service. If you do not agree with any part of these terms, please discontinue use of Safar immediately.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>
              Safar is a travel assistant application offering AI-enabled itinerary generation, personal trip organization, expense tracking, and 
              location-based visit status logging. The services are provided "as is" and are subject to features updates, refinements, or modifications.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">3. AI-Generated Content Disclaimer</h2>
            <p>
              Safar leverages advanced generative Artificial Intelligence (LLMs) to synthesize custom travel itineraries, descriptions, budget guidelines, 
              and local recommendations. While we strive to present high-quality suggestions:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Itinerary suggestions, restaurant pricing, and attraction information are intended for informational purposes only.</li>
              <li>You agree to independently verify opening hours, ticket availability, local safety conditions, and pricing before undertaking any activities.</li>
              <li>Safar shall not be liable for any inaccuracies, trip disruptions, financial losses, or physical incidents occurring from reliance on AI recommendations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">4. Location and Notification Services</h2>
            <p>
              The application uses coordinates data to run the real-time Sight tracker and trigger geographical updates. 
              You can disable location tracking anytime via device settings. The location processing runs on-device and in Firebase, 
              strictly for log and feature functionalities.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">5. User Conduct and Account Termination</h2>
            <p>
              Users are expected to use Safar lawfully. You retain full control over your data and may request total account termination 
              directly from the Profile section of the app. We reserve the right to restrict access to our API endpoints in the event of 
              detected abuse or unauthorized scrapings.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-white mb-3">6. Contact Information</h2>
            <p>
              For legal inquiries, feedback, or support queries regarding these terms, please contact:
            </p>
            <div className="mt-4 flex items-center gap-3 bg-[#121212] p-4 rounded-xl border border-[rgba(201,168,76,0.1)]">
              <Mail size={16} className="text-[#C9A84C]" />
              <a href="mailto:somashekar528234@gmail.com" className="text-white hover:text-[#C9A84C] transition-colors font-medium">somashekar528234@gmail.com</a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
