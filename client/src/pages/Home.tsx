import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faPhone, faEnvelope, faMapMarkerAlt, faClock, faCheckCircle, faAward, faUsers } from "@fortawesome/free-solid-svg-icons";
import drShushil from "../assets/drshushil.jpeg";
import drVijay from "../assets/drvijay.jpeg";
import drPrem from "../assets/drprem.jpeg";

type SpecializationKey = "ortho" | "neuro" | "postop" | "sports" | "geriatric";

type Doctor = {
  name: string;
  experience: number; // Now represents patients served instead of years
  qualification: string;
  photo: string;
};

const PhysioHome = () => {
  const [activeTab, setActiveTab] = useState<SpecializationKey>("ortho");
  const [equation, setEquation] = useState({ a: 0, b: 0 });
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState("direct");
  const [showOTP, setShowOTP] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    otp: "",
    doctorname: "",
    Problem: ""
  });

  const specializations: Record<SpecializationKey, string> = {
    ortho: "Orthopedic",
    neuro: "Neurological",
    postop: "Post-Operative",
    sports: "Sports Injury",
    geriatric: "Geriatric Care"
  };

  const doctors: Record<SpecializationKey, Doctor[]> = {
    ortho: [
      { name: "Dr. Sushil Kamal", experience: 5000, qualification: "MBBS, MS Orthopaedics", photo: drShushil },
      { name: "Dr. Priya Singh", experience: 4500, qualification: "BPT, MPT Orthopaedics", photo: "👩‍⚕️" }
    ],
    neuro: [
      { name: "Dr. Vijay Pathania", experience: 3000, qualification: "BPT, MPT Neuro", photo: drVijay },
      { name: "Dr. Rajesh Sharma", experience: 3500, qualification: "MPT (Neuro)", photo: "👨‍⚕️" }
    ],
    postop: [
      { name: "Dr. Prem Prakash", experience: 2000, qualification: "BPT, NMCH", photo: drPrem },
      { name: "Dr. Sunita Rao", experience: 3200, qualification: "MPT", photo: "👩‍⚕️" }
    ],
    sports: [
      { name: "Dr. Vikram Joshi", experience: 2800, qualification: "BPT, Sports Med", photo: "👨‍⚕️" }
    ],
    geriatric: [
      { name: "Dr. Meena Patel", experience: 4000, qualification: "MPT (Geriatric)", photo: "👩‍⚕️" }
    ]
  };

  const recommendedDoctors = [
    { name: "Dr. Vijay Pathania", experience: 3000, qualification: "BPT, MPT Neuro", designation: "Consultant Physiotherapist", photo: drVijay, trusted: true },
    { name: "Dr. Prem Prakash", experience: 2000, qualification: "BPT, NMCH", designation: "Consultant Physiotherapist", photo: drPrem, trusted: true },
    { name: "Dr. Priya Singh", experience: 4500, qualification: "BPT, MPT Orthopaedics", designation: "Consultant Orthopaedic", photo: "👩‍⚕️", trusted: true },
    { name: "Dr. Sushil Kamal", experience: 5000, qualification: "MBBS, MS Orthopaedics", designation: "Consultant Orthopaedic", photo: drShushil, trusted: true }
  ];

  const handleBooking = async () => {
    const scriptURL = "https://script.google.com/macros/s/AKfycbzr1jvvLyHf-nrvuwoviX9LGKxZa18kyK3-x7oczeqWAQM703j6j25EdON9WtFOVDbZ/exec";

    if (!showOTP) {
      // Validate required fields before showing OTP
      if (!formData.name || !formData.mobile || !formData.address) {
        alert("Please fill in all required fields (Name, Mobile, Address)");
        return;
      }
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      setEquation({ a, b });
      setCorrectAnswer(a + b);
      setShowOTP(true);
      return;
    }

    if (parseInt(formData.otp) !== correctAnswer) {
      alert("Incorrect answer. Please try again.");
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          doctor: formData.doctorname,
          problem: formData.Problem,
          otp: formData.otp,
          bookingType: bookingType,
        }),
      });

      // Add a small delay to ensure submission completes
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert("Booking saved! Our physiotherapist will contact you soon.");
      setShowBookingModal(false);
      setShowOTP(false);
      setFormData({ name: "", mobile: "", address: "", otp: "", doctorname: "", Problem: "" });
    } catch (error) {
      const err = error as Error;
      console.error("Error!", err.message);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Modern Header */}




      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">EM</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                EasyMovement
              </h1>
            </div>

            {/* Desktop Navigation - Hidden on mobile using inline style */}
            <nav
              className="items-center space-x-8"
              style={{ display: window.innerWidth >= 768 ? 'flex' : 'none' }}
            >
              <a href="#services" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">
                Services
              </a>
              <a href="#about" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-slate-700 hover:text-emerald-600 font-medium transition-colors">
                Contact
              </a>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                📅 Book Session
              </button>
            </nav>

            {/* Mobile Menu Button - Visible only on mobile using inline style */}
            <button
              className="text-slate-700 text-2xl focus:outline-none p-2 rounded-lg hover:bg-slate-100"
              style={{ display: window.innerWidth < 768 ? 'flex' : 'none' }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile Menu Dropdown - Only renders when open AND on mobile */}
          {isMobileMenuOpen && (
            <div
              className="border-t border-slate-200 py-4"
              style={{ display: window.innerWidth < 768 ? 'block' : 'none' }}
            >
              <nav className="flex flex-col space-y-2">
                <a
                  href="#services"
                  className="text-slate-700 hover:text-emerald-600 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a
                  href="#about"
                  className="text-slate-700 hover:text-emerald-600 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-slate-700 hover:text-emerald-600 font-medium py-3 px-4 rounded-lg hover:bg-emerald-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <button
                  onClick={() => {
                    setShowBookingModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold mt-2"
                >
                  📅 Book Session
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-3 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm sm:text-base font-semibold animate-pulse">
            🎉 Special Offer: Flat 20% Off on Your First Home Physiotherapy Visit!
          </p>
        </div>
      </div>

      {/* Hero Section - Redesigned */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 rounded-full">
              <span className="text-emerald-700 font-semibold text-sm">Professional Healthcare at Home</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              Expert Physiotherapy<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                At Your Doorstep
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Experience world-class physiotherapy care in the comfort of your home. Our certified experts are just a call away.
            </p>
            <button
              onClick={() => setShowBookingModal(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span>📅 Book Your Session Now</span>
            </button>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">500+</div>
                <div className="text-sm text-slate-600 mt-1">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">15+</div>
                <div className="text-sm text-slate-600 mt-1">Expert Therapists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">98%</div>
                <div className="text-sm text-slate-600 mt-1">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations - Modern Card Design */}
      <section id="services" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Our Specialized Services
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of physiotherapy specializations tailored to your needs
            </p>
          </div>

          {/* Tab Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {Object.entries(specializations).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as SpecializationKey)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === key
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transform scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Doctor Cards - Modern Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {doctors[activeTab]?.map((doctor: Doctor, idx: number) => (
              <div
                key={idx}
                className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    {typeof doctor.photo === 'string' && (doctor.photo.startsWith('👨') || doctor.photo.startsWith('👩')) ? (
                      <div className="text-7xl">{doctor.photo}</div>
                    ) : (
                      <img
                        src={doctor.photo}
                        alt={doctor.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200"
                      />
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{doctor.name}</h4>
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-3">
                    {doctor.experience} Patients Served
                  </div>
                  <p className="text-slate-600 mb-3">{doctor.qualification}</p>
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{specializations[activeTab]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-amber-100 rounded-full mb-4">
              <span className="text-amber-700 font-semibold text-sm">⭐ Top Rated</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Our Most Trusted Therapists
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {recommendedDoctors.map((doctor, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-amber-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200 to-amber-300 rounded-bl-full opacity-20"></div>
                <div className="relative z-10 text-center">
                  <div className="inline-block p-1 bg-amber-100 rounded-full mb-4">
                    {typeof doctor.photo === 'string' && (doctor.photo.startsWith('👨') || doctor.photo.startsWith('👩')) ? (
                      <div className="text-6xl">{doctor.photo}</div>
                    ) : (
                      <img
                        src={doctor.photo}
                        alt={doctor.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-amber-200"
                      />
                    )}
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900 mb-2">{doctor.name}</h4>
                  <div className="text-emerald-700 font-medium mb-3">{doctor.designation}</div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <FontAwesomeIcon icon={faAward} className="text-amber-500" />
                    <span className="text-slate-600 font-semibold">{doctor.experience}+ Patients Served</span>
                  </div>
                  <p className="text-slate-500 text-sm">{doctor.qualification}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Modern Design */}
      <section id="about" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">About EasyMovement</h3>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 sm:p-12">
              <p className="text-lg text-slate-700 leading-relaxed text-center mb-8">
                EasyMovement brings expert physiotherapy care to your home. Our certified physiotherapists specialize in various treatments including orthopedic, neurological, post-operative care, and more. Experience professional healthcare in the comfort of your home.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-emerald-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-2">Certified Experts</h4>
                  <p className="text-sm text-slate-600">Highly qualified professionals</p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faAward} className="text-4xl text-emerald-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-2">Proven Results</h4>
                  <p className="text-sm text-slate-600">Evidence-based treatments</p>
                </div>
                <div className="text-center">
                  <FontAwesomeIcon icon={faUsers} className="text-4xl text-emerald-600 mb-3" />
                  <h4 className="font-bold text-slate-900 mb-2">Patient First</h4>
                  <p className="text-sm text-slate-600">Your comfort is our priority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - Premium Design */}
      <section id="contact" className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">Get In Touch</h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Reach out to us for appointments, questions, or more information about our services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Location */}
            <div className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-750 transition-all duration-300 border border-slate-700">
              <div className="text-emerald-400 text-4xl mb-4">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h4 className="font-bold text-lg mb-3">Our Location</h4>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                Near Sunil Bose, Canal Road<br />Dehri 821307
              </p>
              <a
                href="https://maps.google.com/?q=Dehri+821307"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
              >
                View on map →
              </a>
            </div>

            {/* Phone */}
            <div className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-750 transition-all duration-300 border border-slate-700">
              <div className="text-emerald-400 text-4xl mb-4">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <h4 className="font-bold text-lg mb-3">Call Us Today</h4>
              <a
                href="tel:+917004119766"
                className="text-slate-300 hover:text-white text-sm mb-4 block"
              >
                +917004119766
              </a>
              <a
                href="tel:+917004119766"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
              >
                Call now →
              </a>
            </div>

            {/* Email */}
            <div className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-750 transition-all duration-300 border border-slate-700">
              <div className="text-emerald-400 text-4xl mb-4">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <h4 className="font-bold text-lg mb-3">Email Us</h4>
              <a
                href="mailto:Samarthclinic.info@gmail.com"
                className="text-slate-300 hover:text-white text-sm mb-4 block break-all"
              >
                Samarthclinic.info@gmail.com
              </a>
              <a
                href="mailto:Samarthclinic.info@gmail.com"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
              >
                Send message →
              </a>
            </div>

            {/* Hours */}
            <div className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-750 transition-all duration-300 border border-slate-700">
              <div className="text-emerald-400 text-4xl mb-4">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h4 className="font-bold text-lg mb-3">Opening Hours</h4>
              <p className="text-slate-300 text-sm mb-4">
                Mon-Sun<br />10:00 AM - 08:00 PM
              </p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
              >
                Book appointment →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 EasyMovement. All rights reserved.</p>
          <p className="text-sm">Bringing healthcare to your doorstep with care and compassion.</p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/917004119766"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 z-50 hover:scale-110 animate-bounce"
        aria-label="Chat on WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-3xl" />
      </a>

      {/* Booking Modal - Same Logic, Better Design */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-emerald-100 rounded-full mb-3">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Book Your Session</h3>
              <p className="text-slate-600 mt-2">Fill in your details and we'll get back to you</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />

              <input
                type="tel"
                placeholder="Mobile Number *"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />

              <input
                type="text"
                placeholder="Doctor Name (Optional)"
                value={formData.doctorname}
                onChange={(e) => setFormData({ ...formData, doctorname: e.target.value })}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
              />

              <textarea
                placeholder="Your Address / Problem Details *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 h-24 resize-none focus:border-emerald-500 focus:outline-none transition-colors"
              />

              {showOTP && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <p className="font-semibold text-slate-700 mb-2">
                    🤖 Verify you are human:
                  </p>
                  <p className="text-2xl font-bold mb-3 text-emerald-700">
                    {equation.a} + {equation.b} = ?
                  </p>
                  <input
                    type="text"
                    placeholder="Enter answer"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="w-full border-2 border-emerald-300 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <label className="flex items-center cursor-pointer hover:bg-white p-3 rounded-lg transition-colors">
                  <input
                    type="radio"
                    value="direct"
                    checked={bookingType === "direct"}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="mr-3 w-5 h-5 text-emerald-600"
                  />
                  <span className="text-slate-700 font-medium">📍 Book a Direct Home Visit Session</span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-white p-3 rounded-lg transition-colors">
                  <input
                    type="radio"
                    value="callback"
                    checked={bookingType === "callback"}
                    onChange={(e) => setBookingType(e.target.value)}
                    className="mr-3 w-5 h-5 text-emerald-600"
                  />
                  <span className="text-slate-700 font-medium">📞 Book a Callback for Home Visit</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBooking}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 transform ${isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg hover:scale-105'
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce mr-1"></span>
                      <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce mr-1" style={{ animationDelay: '0.1s' }}></span>
                      <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce mr-2" style={{ animationDelay: '0.2s' }}></span>
                      Submitting...
                    </span>
                  ) : (
                    showOTP ? "✓ Confirm Booking" : "Continue →"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setShowOTP(false);
                    setFormData({ name: "", mobile: "", address: "", otp: "", doctorname: "", Problem: "" });
                  }}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${isSubmitting
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysioHome;