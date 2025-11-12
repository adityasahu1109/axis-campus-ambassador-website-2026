import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';

// --- MODIFICATION: Import all icons from react-icons ---
import { 
  IoChevronDown, 
  IoMail, 
  IoCall, 
  IoRocketSharp 
} from 'react-icons/io5';
import { 
  BsPeopleFill, 
  BsPersonFill, 
  BsCheckCircleFill, 
  BsGiftFill 
} from 'react-icons/bs';
import { 
  FaSchool, 
  FaLightbulb, 
  FaClipboardList, 
  FaTrophy, 
  FaUsers, 
  FaQuestionCircle 
} from 'react-icons/fa';
// --- END MODIFICATION ---


// --- MODIFICATION: All local SVG components have been DELETED ---


// --- Card components (Now use react-icons) ---
const BenefitCard = ({ icon, title, children }) => ( <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 flex flex-col items-center text-center"> <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/10 mb-4">{icon}</div> <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3> <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{children}</p> </div> );
const PerkCard = ({ title, children }) => ( <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"> <h3 className="font-bold text-blue-600 dark:text-blue-400">{title}</h3> <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{children}</p> </div> );
const FaqItem = ({ question, answer, isOpen, onClick }) => ( <div className="border-b border-slate-200 dark:border-slate-700 py-4"> <button onClick={onClick} className="flex justify-between items-center w-full font-semibold text-slate-900 dark:text-white cursor-pointer text-left list-none" aria-expanded={isOpen}> <span>{question}</span> {/* --- MODIFICATION: Used react-icon --- */}<IoChevronDown className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} /> </button> {isOpen && ( <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-left"> {answer} </p> )} </div> );
const ContactCard = ({ name, phone }) => ( <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center"> <h3 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h3> <div className="mt-4 flex justify-center"> <a href={`tel:${phone}`} className="flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"> <IoCall className="h-4 w-4 mr-2" /> <span>{phone}</span> </a> </div> </div> );


// --- StatCard with count-up animation (Logic unchanged) ---
const StatCard = ({ endValue, prefix, suffix, label, duration = 1500, isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return; 

    let startTime = null;
    const animation = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const newCount = Math.floor(percentage * endValue);
      setCount(newCount);

      if (progress < duration) {
        requestAnimationFrame(animation);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animation);

    return () => {
        setCount(endValue);
    }
  }, [isVisible, endValue, duration]);

  return (
    <div className="text-center">
      <span className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400">
        {prefix && count < 10 ? prefix : ''}{count}{suffix}
      </span>
      <p className="mt-1 text-sm sm:text-base font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
};


function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const handleFaqClick = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  
  // Logic for Intersection Observer (Unchanged)
  const statsRef = useRef(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsStatsVisible(true); 
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const currentStatsRef = statsRef.current;
    if (currentStatsRef) {
      observer.observe(currentStatsRef);
    }

    return () => {
      if (currentStatsRef) {
        observer.disconnect();
      }
    };
  }, []); 

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
  
  // --- MODIFICATION: Stored icon class name for section headings ---
  const sectionIconClass = "h-12 w-12 text-blue-600 dark:text-blue-400";

  return (
    <div className="animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center pt-16 pb-24 sm:pt-20 sm:pb-32">
          {/* Logo size is already h-20 sm:h-32, which is correct */}
          <img 
            src={logoLight} 
            alt="Event Logo" 
            className="h-20 sm:h-32 w-auto mx-auto mb-6 block dark:hidden" 
          />
          <img 
            src={logoDark} 
            alt="Event Logo" 
            className="h-20 sm:h-32 w-auto mx-auto mb-6 hidden dark:block" 
          />
          <h2 className="text-2xl font-semibold tracking-tight text-slate-500 dark:text-slate-400"> presents </h2>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-4 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 text-transparent bg-clip-text inline-block pb-3"> Campus Ambassador Program </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            From DMs to Registrations — You Make It Happen! Be the face of AXIS, Central India's Largest Technical Fest by VNIT NAGPUR in your college and city by joining the AXIS Campus Ambassador Program.
          </p>
          <div className="mt-8 flex justify-center">
            <Link 
              to="/login" 
              state={{ isRegister: true }}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* --- MODIFICATION: Icon above heading --- */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex flex-col items-center justify-center gap-y-4">
              <IoRocketSharp className={sectionIconClass} />
              <span>Join Central India's Largest Tech Fest</span>
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              The AXIS'25 Campus Ambassador program is designed for students who carry great interest and passionately participate in and promote the AXIS'25 technical fest on their college campuses. The Campus Ambassador program is an excellent opportunity for students to actively engage with AXIS'25, gain valuable event management and promotion experience, and contribute to the success of the technical fest on their campus.
            </p>
          </div>
          {/* Updated StatCard props (Request 1) */}
          <div ref={statsRef} className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-y-12 gap-x-8">
            <StatCard endValue={3} prefix="0" label="Days" isVisible={isStatsVisible} />
            <StatCard endValue={35} suffix="+" label="Events" isVisible={isStatsVisible} />
            <StatCard endValue={170} suffix="+" label="Colleges" isVisible={isStatsVisible} />
            <StatCard endValue={25} suffix="k+" label="Footfall" isVisible={isStatsVisible} />
            <StatCard endValue={35} suffix="k+" label="Participants" isVisible={isStatsVisible} className="md:col-span-1" />
          </div>
        </div>
      </div>
      
      <div className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* --- MODIFICATION: Icon above heading --- */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex flex-col items-center justify-center gap-y-4">
              <FaSchool className={sectionIconClass} />
              <span>About VNIT Nagpur</span>
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Established in 1960, VNIT is one of the top engineering colleges in India that offer both Under Graduate and Post Graduate level programs for students. With a sprawling campus located in the center of the city, the college also excels in the field of cutting-edge research and technology in engineering, architecture, and science.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* --- MODIFICATION: Icon above heading --- */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex flex-col items-center justify-center gap-y-4">
              <FaLightbulb className={sectionIconClass} />
              <span>Why Become a Campus Ambassador?</span>
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-base text-slate-600 dark:text-slate-400">
              Our College Ambassador Program seeks to ignite a passion for leadership, innovation, and community-building among students. Through mentorship, networking, and hands-on experiences, we aim to nurture tomorrow's change-makers, providing a platform for them to amplify their voices, drive positive impact, and create lasting connections. Join us in shaping the future, one ambassador at a time.
            </p>
          </div>
          {/* --- MODIFICATION: BenefitCard icons --- */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard icon={<BsPeopleFill className="h-8 w-8 text-blue-500" />} title="Networking">Connect with students, professionals, and mentors from across the nation.</BenefitCard>
            <BenefitCard icon={<BsPersonFill className="h-8 w-8 text-blue-500" />} title="Leadership">Develop crucial leadership and management skills by leading your college's participation.</BenefitCard>
            <BenefitCard icon={<BsCheckCircleFill className="h-8 w-8 text-blue-500" />} title="Skill Development">Enhance your communication, marketing, and organizational abilities.</BenefitCard>
            <BenefitCard icon={<BsGiftFill className="h-8 w-8 text-blue-500" />} title="Rewards & Recognition">Earn exclusive goodies, certificates, and recognition for your efforts.</BenefitCard>
          </div>
        </div>
      </div>

      <div className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* --- MODIFICATION: Icon above heading --- */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex flex-col items-center justify-center gap-y-4">
              <FaClipboardList className={sectionIconClass} />
            <span>Your Responsibilities</span>
          </h2>
          <ul className="mt-8 text-left space-y-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Act as the primary point of contact between AXIS, VNIT Nagpur, and your college.</span></li>
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Promote AXIS events and workshops through social media and on-campus activities.</span></li>
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Encourage participation and help register students from your college for various events.</span></li>
            <li className="flex items-start"><span className="text-blue-500 font-bold mr-2">✓</span><span>Coordinate with the AXIS team to organize promotional activities and info sessions.</span></li>
          </ul>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* --- MODIFICATION: Icon above heading --- */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex flex-col items-center justify-center gap-y-4">
            <FaTrophy className={sectionIconClass} />
            <span>Incentives & Perks</span>
          </h2>
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
      
      <div id="contact" className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* --- MODIFICATION: Icon above heading --- */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex flex-col items-center justify-center gap-y-4">
            <FaUsers className={sectionIconClass} />
            <span>Get In Touch</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400"> Have questions or want to learn more? Reach out to one of our organizing heads. </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <ContactCard name="Arya Mali"  phone="+91 70588 08402" />
            <ContactCard name="Arnav Garg" phone="+91 72196 53464" />
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* --- MODIFICATION: Icon above heading --- */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center flex flex-col items-center justify-center gap-y-4">
            <FaQuestionCircle className={sectionIconClass} />
            <span>Frequently Asked Questions</span>
          </h2>
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