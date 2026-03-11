import { useState } from 'react';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';
import { X, BarChart3, Calendar, Video, Clock, CheckCircle, Zap, Brain, TrendingUp, ArrowDown, ChevronLeft, ChevronRight, Users, Target, Award, Shield, Mail, Phone, MessageSquare } from 'lucide-react';

export default function ElevatePage() {
  const [bookingPageOpen, setBookingPageOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    selectedDate: '' as string | null,
    selectedTime: '' as string | null,
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

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
      icon: <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />,
      heading: "Numbers, Sorted",
      description: "You understand your income, expenses, goals, and timelines with clarity."
    },
    {
      id: 2,
      icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />,
      heading: "Discipline, Built",
      description: "You've stayed consistent and committed through structured sprints."
    },
    {
      id: 3,
      icon: <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />,
      heading: "Financial Maturity",
      description: "You understand the 'why' behind your decisions, not just the mechanics."
    },
    {
      id: 5,
      icon: <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />,
      heading: "Ready to Elevate",
      description: "Expert guidance adds validation, confidence, and clarity on next steps."
    }
  ];

  const whatToExpect = [
    {
      id: 1,
      icon: <Calendar className="h-5 w-5 text-emerald-600" />,
      title: "Flexible Scheduling",
      description: "Choose a time that works best for you"
    },
    {
      id: 2,
      icon: <Video className="h-5 w-5 text-emerald-600" />,
      title: "Virtual Meeting",
      description: "Connect via Google Meet from anywhere"
    },
    {
      id: 3,
      icon: <Clock className="h-5 w-5 text-emerald-600" />,
      title: "60-Minute Session",
      description: "In-depth consultation with our experts"
    }
  ];

  const premiumBenefits = [
    {
      icon: <Target className="h-5 w-5 text-emerald-600" />,
      text: "Personalized wealth strategy"
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      text: "Portfolio optimization review"
    },
    {
      icon: <Shield className="h-5 w-5 text-emerald-600" />,
      text: "Tax-efficient planning"
    },
    {
      icon: <Award className="h-5 w-5 text-emerald-600" />,
      text: "Retirement roadmap analysis"
    },
    {
      icon: <Users className="h-5 w-5 text-emerald-600" />,
      text: "Priority support access"
    }
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00',
    '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00'
  ];

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(selectedMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
      selectedMonth.getMonth() === today.getMonth() &&
      selectedMonth.getFullYear() === today.getFullYear();
  };

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <CanonicalPageHeader
        title="You've already done the hard work"
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="w-full max-w-6xl mx-auto">

          {/* Horizontal Progress Flow - Mobile Optimized */}
          <div className="mb-8 sm:mb-10">
            <div className="relative overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide pb-2">
                <div className="flex gap-3 sm:gap-6 py-4 sm:py-8 px-1 min-w-min">
                  <svg
                    className="absolute top-0 left-0 w-full h-12 pointer-events-none hidden sm:block"
                    style={{ minWidth: `${steps.length * 300}px`, height: '48px' }}
                    preserveAspectRatio="none"
                  >
                    <line
                      x1="30"
                      y1="24"
                      x2={steps.length * 300 - 30}
                      y2="24"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  {steps.map((step, index) => (
                    <div key={step.id} className="shrink-0 w-64 sm:w-72">
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 relative hover:shadow-md transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105">
                        <div className={`absolute -top-4 sm:-top-6 left-4 sm:left-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-4 ${index === steps.length - 1 ? 'border-emerald-200' : 'border-emerald-200'
                          } flex items-center justify-center z-10`}>
                          {index === steps.length - 1 ? (
                            <ArrowDown className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                          )}
                        </div>

                        <div className="mt-2 sm:mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            {step.icon}
                            <h3 className="font-semibold text-sm sm:text-base text-slate-900">
                              {step.heading}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Card - Mobile Optimized */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-xl sm:rounded-2xl border border-emerald-200 p-6 sm:p-8 md:p-10 relative overflow-hidden mb-8 sm:mb-12">
            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-emerald-200 rounded-full filter blur-3xl opacity-20 -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2">
                  Ready to elevate further?
                </h2>
                <p className="text-sm sm:text-base text-slate-700 max-w-2xl">
                  Discuss your journey with a wealth manager, validate your plan, and gain confidence on next steps.
                </p>
              </div>

              <button
                onClick={() => setBookingPageOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all shadow-md hover:shadow-lg w-full md:w-auto whitespace-nowrap transform hover:scale-105 text-sm sm:text-base"
              >
                Book a Session
              </button>
            </div>
          </div>

          {/* What to Expect & Premium Benefits - Mobile Optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 md:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 flex items-center gap-2">
                <span className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </span>
                What to Expect
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {whatToExpect.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-300 hover:border-emerald-200 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors w-fit">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 md:p-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 flex items-center gap-2">
                <span className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                </span>
                Premium Benefits
              </h2>

              <div className="space-y-2 sm:space-y-3">
                {premiumBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg sm:rounded-xl border border-emerald-100 p-3 sm:p-4 md:p-5 flex items-start gap-2 sm:gap-3 hover:shadow-md transition-all duration-300 hover:border-emerald-200 transform hover:scale-[1.01] sm:hover:scale-[1.02]"
                  >
                    <div className="bg-emerald-50 p-1.5 rounded-lg flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <p className="text-sm sm:text-base text-slate-700">{benefit.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Booking Page - Mobile Optimized */}
      {bookingPageOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-slate-50">
          <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
            <div className="max-w-7xl mx-auto">
              {/* Canonical Header for Booking Modal */}
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
              {/* Progress Steps - Mobile Optimized */}
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

              {/* Main Content Grid - Mobile Optimized */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* LEFT: Booking Form */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                  {/* Personal Information - Mobile Optimized */}
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

                  {/* Date Selection - Mobile Optimized with Improved UI */}
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
                        onClick={handlePrevMonth}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      </button>
                      <h3 className="text-sm sm:text-base md:text-lg font-medium text-slate-900">
                        {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        onClick={handleNextMonth}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                      </button>
                    </div>

                    {/* Calendar Grid - Mobile Optimized */}
                    <div className="date-picker-grid">
                      {weekdays.map(day => (
                        <div key={day} className="text-center text-xs sm:text-sm font-medium text-slate-600 py-1 sm:py-2">
                          {day}
                        </div>
                      ))}

                      {Array.from({ length: startingDay }).map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square p-1 sm:p-2"></div>
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isSelected = formData.selectedDate === dateStr;
                        const isAvailable = day > 2 && day < 28; // Mock availability
                        const today = isToday(day);

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
                              } ${today && isAvailable ? 'border border-emerald-300' : ''}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection - Mobile Optimized */}
                  {formData.selectedDate && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 animate-fadeIn">
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                        <span className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                        </span>
                        Select a Time
                      </h2>

                      <div className="time-slot-grid">
                        {timeSlots.map((slot) => {
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

                  {/* Additional Notes - Mobile Optimized */}
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

                {/* RIGHT: Order Summary - Mobile Optimized (No Gradient, Just Emerald) */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
                    <div className="bg-emerald-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 text-white">
                      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                        <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                        Session Summary
                      </h2>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-emerald-500 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <p className="text-xs opacity-90 mb-1">Session Type</p>
                          <p className="text-sm sm:text-base font-semibold">Financial Readiness Guidance</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="bg-emerald-500 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mb-1 opacity-90" />
                            <p className="text-xs opacity-90">Duration</p>
                            <p className="text-sm sm:text-base font-semibold">30-45 min</p>
                          </div>

                          <div className="bg-emerald-500 rounded-lg sm:rounded-xl p-3 sm:p-4">
                            <Video className="h-3 w-3 sm:h-4 sm:w-4 mb-1 opacity-90" />
                            <p className="text-xs opacity-90">Platform</p>
                            <p className="text-sm sm:text-base font-semibold">Google Meet</p>
                          </div>
                        </div>

                        {formData.selectedDate && (
                          <div className="bg-emerald-500 rounded-lg sm:rounded-xl p-3 sm:p-4">
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
                          <div className="bg-emerald-500 rounded-lg sm:rounded-xl p-3 sm:p-4">
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
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all shadow-md hover:shadow-lg text-base sm:text-lg transform hover:scale-[1.02]"
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

      {/* Enhanced Success Modal - Mobile Optimized */}
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add keyframe animations */}
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