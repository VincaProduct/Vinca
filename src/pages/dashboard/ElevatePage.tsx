import { useState, useRef, useEffect } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { X, BarChart3, Calendar, Video, Clock, CheckCircle, Zap, Brain, TrendingUp, ArrowDown, ChevronLeft, ChevronRight, Users, Target, Award, Shield, Mail, Phone, MessageSquare } from 'lucide-react';
import financialReadinessImg from '@/assets/fiinancial_readiness_elevate.jpeg';
import lifestyleImg from '@/assets/lifestyle_elevate.jpeg';
import healthStressImg from '@/assets/health_stress_elevate.jpeg';
import expertGuidanceImg from '@/assets/elevate.jpeg';

export default function ElevatePage() {
  const [bookingPageOpen, setBookingPageOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState({
    selectedDate: '' as string | null,
    selectedTime: '' as string | null,
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  // Ref for steps section
  const stepsRef = useRef<HTMLDivElement>(null);

  // Helper to detect if user is in steps section
  const isInStepsSection = () => {
    if (!stepsRef.current) return false;
    const rect = stepsRef.current.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };

  const handleConfirmBooking = () => {
    if (formData.selectedDate && formData.selectedTime && formData.name && formData.email) {
      setSuccessModalOpen(true);
      setBookingPageOpen(false);
      setFormData({
        selectedDate: null,
        selectedTime: null,
        name: '',
        email: '',
        phone: '',
        notes: '',
      });
    }
  };

  const handleCloseSuccess = () => {
    setSuccessModalOpen(false);
  };

  // WHEEL HANDLER - Premium sequential feel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (bookingPageOpen) return;

      const inSteps = isInStepsSection();
      if (!inSteps) return;

      e.preventDefault();
      e.stopPropagation();

      // 🚨 BLOCK while animation running
      if (isTransitioning) return;

      const direction = e.deltaY > 0 ? 'down' : 'up';

      if (direction === 'down') {
        if (activeStep === 4) return; // Already at last step
        setIsTransitioning(true);
        setActiveStep(prev => Math.min(prev + 1, 4));
      } else {
        if (activeStep === 1) return; // Already at first step
        setIsTransitioning(true);
        setActiveStep(prev => Math.max(prev - 1, 1));
      }

      // 🧠 KEY: Longer pause after movement (animation + settle time)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1100); // 900ms animation + 200ms pause
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => window.removeEventListener('wheel', handleWheel);
  }, [bookingPageOpen, activeStep, isTransitioning]);

  // TOUCH HANDLER - Mobile swipe with transition lock
  useEffect(() => {
    let startY = 0;
    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (bookingPageOpen) return;

      const inSteps = isInStepsSection();
      if (!inSteps) return;

      startY = e.touches[0].clientY;
      isTouching = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (bookingPageOpen || !isTouching) return;

      const inSteps = isInStepsSection();
      if (!inSteps) return;

      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (bookingPageOpen || !isTouching) return;

      const inSteps = isInStepsSection();
      if (!inSteps) return;

      // 🚨 BLOCK while animation running
      if (isTransitioning) return;

      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      isTouching = false;

      if (Math.abs(diff) < 80) return;

      if (diff > 0) {
        // swipe up → next step
        if (activeStep === 4) return;
        setIsTransitioning(true);
        setActiveStep(prev => Math.min(prev + 1, 4));
      } else {
        // swipe down → previous step
        if (activeStep === 1) return;
        setIsTransitioning(true);
        setActiveStep(prev => Math.max(prev - 1, 1));
      }

      // 🧠 Same pause after touch movement
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1100);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [bookingPageOpen, activeStep, isTransitioning]);

  // KEYBOARD HANDLER - Arrow keys with transition lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (bookingPageOpen) return;

      const inSteps = isInStepsSection();
      if (!inSteps) return;

      // 🚨 BLOCK while animation running
      if (isTransitioning) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeStep === 4) return;
        setIsTransitioning(true);
        setActiveStep(prev => Math.min(prev + 1, 4));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeStep === 1) return;
        setIsTransitioning(true);
        setActiveStep(prev => Math.max(prev - 1, 1));
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 1100);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookingPageOpen, activeStep, isTransitioning]);

  const scrollbarHideStyles = `
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    .date-picker-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    
    @media (min-width: 640px) {
      .date-picker-grid {
        gap: 4px;
      }
    }
    
    .time-slot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 6px;
    }
    
    @media (min-width: 640px) {
      .time-slot-grid {
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 8px;
      }
    }
  `;

  const steps = [
    {
      id: 1,
      heading: "Know your numbers. For real.",
      description: "Not guesses. Not rough estimates.\nSee exactly where you stand — income, expenses, gaps.\n\nThis is your financial baseline."
    },
    {
      id: 2,
      heading: "Design the life you actually want.",
      description: "Money isn't the goal — your life is.\nMap your future lifestyle and what it truly costs.\n\nNow your numbers have direction."
    },
    {
      id: 3,
      heading: "Make your plan sustainable for your health.",
      description: "Financial decisions affect more than money — they impact your stress and wellbeing.\nAccount for real-life pressure and uncertainty.\n\nNow your plan supports your health."
    },
    {
      id: 4,
      heading: "You've seen the numbers. Now make them work.",
      description: "You've tracked your readiness.\nYou've designed your life.\nYou've understood your stress.\n\nNow it's time to connect the dots.\n\nElevate your financial journey with a 1:1 expert session."
    }
  ];

  // Get left side content based on active step
  const leftContent = [
    {
      image: financialReadinessImg,
      title: "Financial Readiness Score",
      
      cta: "Analyze my readiness"
    },
    {
      image: lifestyleImg,
      title: "Lifestyle Design Planner",
      cta: "Plan my lifestyle"
    },
    {
      image: healthStressImg,
      title: "Peace of Mind Check",
      cta: "Check my balance"
    },
    {
      image: expertGuidanceImg,
      title: "Expert Guidance Session",
      cta: "Elevate with an expert"
    }
  ];

  const current = leftContent[activeStep - 1];

  return (
    <>
      <style>{scrollbarHideStyles}</style>

      {/* Main container - now allows normal scrolling */}
      <div className="min-h-screen w-full bg-background">

        {/* SECTION 1: PREMIUM HERO */}
        <section className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          {/* Radial glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]"></div>
          
          <div className="text-center space-y-8 max-w-3xl px-4 relative z-10">
            <h1 className="text-5xl sm:text-6xl font-semibold text-foreground leading-tight tracking-tight">
              You're managing money.
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                But are you building your life?
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tracking expenses is step one. <span className="text-foreground font-medium">Designing your future</span> is what actually matters.
            </p>

            <button
              onClick={() => setBookingPageOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
            >
              Start my clarity journey
            </button>
          </div>
        </section>

        {/* SECTION 2: STEPS - Fixed screen, controlled swipe */}
        <section
          ref={stepsRef}
          className="h-screen w-full overflow-hidden"
        >
          <div className="h-full grid grid-cols-1 lg:grid-cols-2">

            {/* LEFT SIDE - PRODUCT CONTAINER */}
            <div className="flex items-center justify-center px-4 sm:px-8 py-8 order-2 lg:order-1">
              <div className="w-full max-w-lg bg-card border border-border shadow-md rounded-2xl p-8 sm:p-10 transition-all duration-500">
                
                {/* Image Area */}
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-muted">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  {current.title}
                </h3>

                {/* CTA Button */}
                <button
                  onClick={() => activeStep === 4 ? setBookingPageOpen(true) : null}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02]"
                >
                  {current.cta}
                </button>
              </div>
            </div>

            {/* RIGHT SIDE - CLEAN STEPS (NO BOX) - Slides with controlled swipe */}
            <div className="relative overflow-hidden h-full order-1 lg:order-2">
              <div
                className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: `translateY(-${(activeStep - 1) * 100}%)`
                }}
              >
                {steps.map((step, index) => (
                  <div key={index} className="h-screen flex items-center px-6 sm:px-12">
                    <div className="max-w-xl space-y-4">
                      <div className="text-primary text-sm font-medium tracking-wide">
                        STEP {index + 1}
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                        {step.heading}
                      </h2>
                      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed transition-all duration-500 delay-150 whitespace-pre-line">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Step indicator for swipe */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${step === activeStep
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30'
                }`}
            />
          ))}
        </div>

        <div className="fixed bottom-8 right-8 text-muted-foreground text-sm hidden sm:block z-20">
          Swipe ↑ ↓
        </div>

        {/* Hero indicator */}
        <div className="fixed bottom-8 left-8 text-muted-foreground/60 text-sm hidden sm:block z-20">
          Hero • Steps
        </div>
      </div>

      {/* BOOKING MODAL */}
      {bookingPageOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-slate-50">
          <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
            <div className="max-w-7xl mx-auto">
              <CanonicalPageHeader
                title="Book Your Session"
                actions={
                  <button
                    onClick={() => setBookingPageOpen(false)}
                    className="hidden sm:inline-flex items-center justify-center border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 h-8 w-8 rounded-full p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                }
                mobileActionButton={
                  <button
                    onClick={() => setBookingPageOpen(false)}
                    className="sm:hidden border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 h-8 w-8 rounded-full flex items-center justify-center p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                }
              />
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-4 sm:mb-8 bg-white rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-6">
                {['Details', 'Schedule', 'Confirm'].map((step, idx) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm ${idx === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                        {idx + 1}
                      </div>
                      <span className={`hidden sm:block ml-2 text-xs sm:text-sm font-medium ${idx === 0 ? 'text-emerald-600' : 'text-slate-600'
                        }`}>{step}</span>
                    </div>
                    {idx < 2 && <div className="flex-1 h-0.5 mx-2 sm:mx-4 bg-slate-200"></div>}
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* LEFT: Booking Form */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                  {/* Personal Information */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <span className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      </span>
                      Your Information
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2 block">
                          Full Name <span className="text-emerald-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full border border-slate-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2 block">
                            Email <span className="text-emerald-600">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="john@example.com"
                              className="w-full border border-slate-300 rounded-lg pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2 block">
                            Phone (Optional)
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+1 (555) 000-0000"
                              className="w-full border border-slate-300 rounded-lg pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-2.5 sm:py-3 text-sm sm:text-base text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <span className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      </span>
                      Select a Date
                    </h2>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <button
                        onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      </button>
                      <h3 className="text-sm sm:text-base md:text-lg font-medium text-slate-900">
                        {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="date-picker-grid">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs sm:text-sm font-medium text-slate-600 py-1 sm:py-2">
                          {day}
                        </div>
                      ))}

                      {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() }).map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square p-1 sm:p-2"></div>
                      ))}

                      {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate() }).map((_, index) => {
                        const day = index + 1;
                        const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSelected = formData.selectedDate === dateStr;
                        const isAvailable = day > 2 && day < 28;

                        return (
                          <button
                            key={day}
                            onClick={() => isAvailable && setFormData({ ...formData, selectedDate: dateStr })}
                            disabled={!isAvailable}
                            className={`aspect-square p-1 sm:p-2 rounded-lg transition-all text-xs sm:text-sm ${isSelected
                                ? 'bg-emerald-600 text-white font-medium'
                                : isAvailable
                                  ? 'hover:bg-emerald-50 hover:border-emerald-200 border border-transparent'
                                  : 'text-slate-300 cursor-not-allowed'
                              }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {formData.selectedDate && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                        <span className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                        </span>
                        Select a Time
                      </h2>

                      <div className="time-slot-grid">
                        {['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map((slot) => {
                          const hour = parseInt(slot.split(':')[0]);
                          const min = slot.split(':')[1];
                          const ampm = hour >= 12 ? 'PM' : 'AM';
                          const displayHour = hour % 12 || 12;
                          const isSelected = formData.selectedTime === slot;

                          return (
                            <button
                              key={slot}
                              onClick={() => setFormData({ ...formData, selectedTime: slot })}
                              className={`p-2 sm:p-3 rounded-lg border transition-all text-xs sm:text-sm ${isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'border-slate-200 hover:border-emerald-200 hover:bg-emerald-50'
                                }`}
                            >
                              {displayHour}:{min} {ampm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
                    <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                      <span className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                      </span>
                      Additional Notes (Optional)
                    </h2>

                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any specific topics you'd like to discuss?"
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg p-2.5 sm:p-3 text-sm sm:text-base text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* RIGHT: Order Summary */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
                    <div className="bg-primary rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
                      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                        Session Summary
                      </h2>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-primary/80 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <p className="text-xs opacity-90 mb-1">Session Type</p>
                          <p className="text-sm sm:text-base font-semibold">Financial Readiness Guidance</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="bg-primary/80 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mb-1 opacity-90" />
                            <p className="text-xs opacity-90">Duration</p>
                            <p className="text-sm sm:text-base font-semibold">30-45 min</p>
                          </div>

                          <div className="bg-primary/80 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <Video className="h-3 w-3 sm:h-4 sm:w-4 mb-1 opacity-90" />
                            <p className="text-xs opacity-90">Platform</p>
                            <p className="text-sm sm:text-base font-semibold">Google Meet</p>
                          </div>
                        </div>

                        {formData.selectedDate && (
                          <div className="bg-primary/80 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <p className="text-xs opacity-90 mb-1">Selected Date</p>
                            <p className="text-sm sm:text-base font-semibold">
                              {new Date(formData.selectedDate).toLocaleDateString('default', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}

                        {formData.selectedTime && (
                          <div className="bg-primary/80 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <p className="text-xs opacity-90 mb-1">Selected Time</p>
                            <p className="text-sm sm:text-base font-semibold">
                              {(() => {
                                const hour = parseInt(formData.selectedTime.split(':')[0]);
                                const min = formData.selectedTime.split(':')[1];
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour % 12 || 12;
                                return `${displayHour}:${min} ${ampm}`;
                              })()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                  <button
                    onClick={handleConfirmBooking}
                    disabled={!formData.selectedDate || !formData.selectedTime || !formData.name || !formData.email}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-md hover:shadow-lg text-base sm:text-lg transform hover:scale-[1.02]"
                  >
                    Confirm & Book
                  </button>

                    <p className="text-xs text-slate-500 text-center px-2">
                      By booking, you agree to our terms. You'll receive a Google Meet link after confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center transform animate-scaleIn mx-4">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center animate-bounce">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
              Session Booked! 🎉
            </h2>

            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
              Your guidance session has been scheduled. You'll receive the meeting link on your email.
            </p>

            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left">
              <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2">What's next?</p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>Check your email for confirmation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>Add the event to your calendar</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                  <span>Prepare any questions you have</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleCloseSuccess}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}