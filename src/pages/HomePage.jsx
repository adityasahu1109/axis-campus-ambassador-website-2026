import React, { useState, useEffect } from 'react';
// --- MODIFICATION: Import 'Link' from 'react-router-dom' ---
import { Link, useNavigate } from 'react-router-dom';
// --- END MODIFICATION ---
import { useAuth } from '../AuthContext';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';

// ... (all other components like ChevronDownIcon, NetworkIcon, etc. are unchanged) ...
const ChevronDownIcon = ({ isOpen }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /> </svg> );
const NetworkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM3 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const LeadershipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const SkillIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.471a9 9 0 11-12.728 0 9 9 0 0112.728 0z" /></svg>;
const RewardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-1m0-1v-1m0 2v1m0 1v1M5 12H4m1-1H4m18 0h-1m-1 0h-1m-4-4l.707-.707M6.343 6.343l.707.707m12.728 0l-.707.707M6.343 17.657l.707-.707M12 22a10 10 0 110-20 10 10 0 010 20z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const BenefitCard = ({ icon, title, children }) => ( <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"> <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/10 mb-4">{icon}</div> <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3> <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{children}</p> </div> );
const PerkCard = ({ title, children }) => ( <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"> <h3 className="font-bold text-blue-600 dark:text-blue-400">{title}</h3> <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{children}</p> </div> );
const FaqItem = ({ question, answer, isOpen, onClick }) => ( <div className="border-b border-slate-200 dark:border-slate-700 py-4"> <button onClick={onClick} className="flex justify-between items-center w-full font-semibold text-slate-900 dark:text-white cursor-pointer text-left list-none" aria-expanded={isOpen}> <span>{question}</span> <ChevronDownIcon isOpen={isOpen} /> </button> {isOpen && ( <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-left"> {answer} </p> )} </div> );
const ContactCard = ({ name, email, phone }) => ( <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-left"> <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h3> <p className="text-sm text-slate-500 dark:text-slate-400">Head of Organizing Committee</p> <div className="mt-4 space-y-2"> <a href={`mailto:${email}`} className="flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"> <MailIcon /> <span>{email}</span> </a> <a href={`tel:${phone}`} className="flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"> <PhoneIcon /> <span>{phone}</span> </a> </div> </div> );


function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const handleFaqClick = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'student') {
        navigate('/dashboard', { replace: true });
      } else if (profile.role === 'organizer') {
        navigate('/admin', { replace: true });
      }
    }
  }, [profile, loading, navigate]);

  if (loading || profile) {
    return <div className="w-full min-h-screen bg-white dark:bg-slate-900" />;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-16 pb-24 sm:pt-24 sm:pb-32">
          <img 
            src={logoLight} 
            alt="Event Logo" 
            className="h-32 w-auto mx-auto mb-6 block dark:hidden" 
          />
          <img 
            src={logoDark} 
            alt="Event Logo" 
            className="h-32 w-auto mx-auto mb-6 hidden dark:block" 
          />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-500 dark:text-slate-400"> presents </h2>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-4 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-transparent bg-clip-text inline-block pb-3"> Campus Ambassador Program </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400"> Be the face of AXIS'25 in your college. Join a nationwide community of student leaders and innovators. </p>
          <div className="mt-8 flex justify-center">
            {/* --- MODIFICATION: Added state={{ isRegister: true }} --- */}
            <Link 
              to="/login" 
              state={{ isRegister: true }}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Register Now
            </Link>
            {/* --- END MODIFICATION --- */}
          </div>
        </div>
      </div>
      {/* ... (rest of the file is unchanged) ... */}
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">About AXIS</h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400"> AXIS, the annual technical festival of VNIT Nagpur, is a beacon of innovation, drawing over 20,000 students from across India. It's a platform where technology meets creativity, featuring a diverse range of events, workshops, and competitions designed to inspire the next generation of engineers and thinkers. </p>
        </div>
      </div>
      <div className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Why Become a Campus Ambassador?</h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard icon={<NetworkIcon />} title="Networking">Connect with students, professionals, and mentors from across the nation.</BenefitCard>
            <BenefitCard icon={<LeadershipIcon />} title="Leadership">Develop crucial leadership and management skills by leading your college's participation.</BenefitCard>
            <BenefitCard icon={<SkillIcon />} title="Skill Development">Enhance your communication, marketing, and organizational abilities.</BenefitCard>
            <BenefitCard icon={<RewardIcon />} title="Rewards & Recognition">Earn exclusive goodies, certificates, and recognition for your efforts.</BenefitCard>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Your Responsibilities</h2>
          <ul className="mt-8 text-left space-y-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Act as the primary point of contact between AXIS, VNIT Nagpur, and your college.</span></li>
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Promote AXIS events and workshops through social media and on-campus activities.</span></li>
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Encourage participation and help register students from your college for various events.</span></li>
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Coordinate with the AXIS team to organize promotional activities and info sessions.</span></li>
          </ul>
        </div>
      </div>
      <div className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Incentives & Perks</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            <PerkCard title="Certificates">Receive a prestigious certificate from AXIS, VNIT Nagpur, recognizing your contribution.</PerkCard>
            <PerkCard title="Letter of Recommendation (LOR)">Top-performing ambassadors will receive a valuable LOR from the esteemed faculty of VNIT.</PerkCard>
            <PerkCard title="Internship Opportunities">Gain a chance to secure internship opportunities with our associated companies.</PerkCard>
            <PerkCard title="Exclusive Goodies">Win exclusive AXIS merchandise, tech gadgets, and swag based on your performance.</PerkCard>
            <PerkCard title="Social Media Shoutouts">Get featured on all the official social media handles of AXIS, VNIT Nagpur.</PerkCard>
            <PerkCard title="Free Passes & Workshops">Enjoy complimentary access to paid workshops and premium events during the festival.</PerkCard>
          </div>
        </div>
      </div>
      <div id="contact" className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Get In Touch</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400"> Have questions or want to learn more? Reach out to one of our organizing heads. </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <ContactCard name="Aditya Sahu" email="adityasahu@example.com" phone="+91 12345 67890" />
            <ContactCard name="Rohan Sharma" email="rohansharma@example.com" phone="+91 09876 54321" />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900/50 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center">Frequently Asked Questions</h2>
          <div className="mt-10">
            <FaqItem question="Who can apply for the Campus Ambassador program?" answer="Any student currently enrolled in an undergraduate or postgraduate program in any college or university is eligible to apply. We are looking for enthusiastic individuals with strong communication skills, a robust social network, and a passion for technology and community building. First and second-year students are especially encouraged to apply." isOpen={openFaq === 0} onClick={() => handleFaqClick(0)} />
            <FaqItem question="Is there any registration fee?" answer="Absolutely not! The Campus Ambassador program is a completely free initiative. Our goal is to build a nationwide community of student leaders, and we believe there should be no financial barriers to joining and showcasing your talent." isOpen={openFaq === 1} onClick={() => handleFaqClick(1)} />
            <FaqItem question="What is the duration of the program?" answer="The program will officially commence from the date of your selection and will continue until the conclusion of our annual fest, AXIS'25. The entire duration is designed to provide you with ample time to complete tasks, network, and grow with us. The exact timeline will be communicated to all selected ambassadors via email." isOpen={openFaq === 2} onClick={() => handleFaqClick(2)} />
            <FaqItem question="How will my performance be judged?" answer="Your performance is judged based on a transparent point system. You will be assigned various tasks, such as social media promotion, content creation, and referral registrations. Points are awarded upon successful completion and review of these tasks through this portal. Your total score determines your position on the leaderboard and your eligibility for our exciting range of rewards and incentives." isOpen={openFaq === 3} onClick={() => handleFaqClick(3)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;