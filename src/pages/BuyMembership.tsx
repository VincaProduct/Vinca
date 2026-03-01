import React, { useState, useEffect } from "react";
import CanonicalPageHeader from "@/components/ui/CanonicalPageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Wallet,
  Building,
  Sparkles,
  Shield,
  Award,
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Calendar,
  Lock,
  Star,
  Info,
  ChevronLeft,
  User,
  CreditCard as CreditCardIcon,
  ShoppingBag
} from "lucide-react";


function PaymentMethodIcon({ method }) {
  switch (method) {
    case "UPI":
      return <Wallet className="w-5 h-5" />;
    case "Card":
      return <CreditCard className="w-5 h-5" />;
    case "Net Banking":
      return <Building className="w-5 h-5" />;
    default:
      return null;
  }
}

function WelcomeModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-card rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold mb-3 text-foreground">Almost there! 🎉</h2>
        <p className="text-muted-foreground mb-8">
          You're just one step away from unlocking premium features and your personalized dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <Button className="w-full bg-emerald-600 dark:bg-emerald-700 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-800 transition" onClick={() => window.location.href = '/auth'}>
            Continue to Sign In
          </Button>
          <Button variant="outline" className="w-full py-4 rounded-xl border-border text-muted-foreground hover:bg-muted transition-all duration-200" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
          <Lock className="w-3 h-3" />
          <span>Secure checkout powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}

export default function BuyMembership() {
  // Force theme sync on every render
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    referral: ""
  });
  const [focusedField, setFocusedField] = useState(null);

  const benefits = [
    { icon: <Zap className="w-4 h-4" />, text: "Priority Support" },
    { icon: <Award className="w-4 h-4" />, text: "Exclusive Content" },
    { icon: <Users className="w-4 h-4" />, text: "Community Access" }
  ];

  const steps = [
    { number: 1, title: "Personal Info", icon: User },
    { number: 2, title: "Payment", icon: CreditCardIcon },
    { number: 3, title: "Review", icon: ShoppingBag }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isPersonalInfoValid = () => {
    return formData.fullName && formData.email && formData.phone;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isPersonalInfoValid()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompletePurchase = () => {
    if (currentStep === 3) {
      setModalOpen(true);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full p-8 border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Your Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-medium text-foreground mb-2">Full Name <span className="text-emerald-500">*</span></label>
                <Input 
                  name="fullName" 
                  placeholder="John Doe" 
                  type="text" 
                  required 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  onFocus={() => setFocusedField('fullName')} 
                  onBlur={() => setFocusedField(null)} 
                  className="h-12 border-border focus:border-emerald-500 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-base font-medium text-foreground mb-2">Email <span className="text-emerald-500">*</span></label>
                <Input 
                  name="email" 
                  placeholder="john@example.com" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  onFocus={() => setFocusedField('email')} 
                  onBlur={() => setFocusedField(null)} 
                  className="h-12 border-border focus:border-emerald-500 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-base font-medium text-foreground mb-2">Phone Number <span className="text-emerald-500">*</span></label>
                <Input 
                  name="phone" 
                  placeholder="+91 98765 43210" 
                  type="tel" 
                  required 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  onFocus={() => setFocusedField('phone')} 
                  onBlur={() => setFocusedField(null)} 
                  className="h-12 border-border focus:border-emerald-500 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-base font-medium text-foreground mb-2">Referral Code <span className="text-muted-foreground">(optional)</span></label>
                <Input 
                  name="referral" 
                  placeholder="Enter code" 
                  type="text" 
                  value={formData.referral} 
                  onChange={handleInputChange} 
                  onFocus={() => setFocusedField('referral')} 
                  onBlur={() => setFocusedField(null)} 
                  className="h-12 border-border focus:border-emerald-500 focus:ring-emerald-500" 
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6 flex items-center gap-2">
              <Info className="w-3 h-3" />
              <span>Fields marked with * are required</span>
            </p>
          </Card>
        );
      case 2:
        return (
          <Card className="w-full p-8 border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Select Payment Method</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["UPI", "Card", "Net Banking"].map((method) => (
                <label 
                  key={method} 
                  className={`flex items-center sm:flex-col sm:text-center gap-3 sm:gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === method 
                      ? 'border-emerald-500 bg-muted' 
                      : 'border-border bg-card hover:border-emerald-200 hover:bg-muted'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method} 
                    checked={paymentMethod === method} 
                    onChange={() => setPaymentMethod(method)} 
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 sm:order-2" 
                  />
                  <div className="flex items-center sm:flex-col gap-2 sm:gap-1 flex-1 sm:order-1">
                    <PaymentMethodIcon method={method} />
                    <span className="font-medium text-base text-foreground">{method}</span>
                  </div>
                  {paymentMethod === method && (
                    <CheckCircle className="w-4 h-4 text-emerald-500 sm:order-3" />
                  )}
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              <span>Your payment information is encrypted and secure</span>
            </p>
          </Card>
        );
      case 3:
        return (
          <Card className="w-full p-8 border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Review Your Order</h2>
            </div>
            <div className="space-y-6">
              {/* Personal Info Summary */}
              <div className="bg-muted p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-medium text-foreground">Personal Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium text-foreground">{formData.fullName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{formData.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{formData.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Referral</p>
                    <p className="font-medium text-foreground">{formData.referral || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method Summary */}
              <div className="bg-muted p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-medium text-foreground">Payment Method</h3>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentMethodIcon method={paymentMethod} />
                  <span className="font-medium text-foreground">{paymentMethod}</span>
                </div>
              </div>

              {/* Membership Summary */}
              <div className="bg-muted p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-medium text-foreground">Membership Details</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium text-foreground">Vinca Premium (Yearly)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium text-foreground">₹2,500/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Savings</span>
                    <span className="font-medium text-emerald-600">20%</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
                    <span className="text-emerald-600">{benefit.icon}</span>
                    <span className="text-sm text-emerald-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full max-w-full overflow-x-hidden">
      <CanonicalPageHeader title="Get Financially Ready with Vinca" />
      <div className="w-full px-6 sm:px-8 lg:px-12 py-10 max-w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto space-y-10 max-w-full overflow-x-hidden">
          <Card className="w-full p-8 border border-border bg-card dark:bg-card shadow-sm max-w-full overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 max-w-full overflow-x-hidden">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0 max-w-full overflow-x-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 max-w-full overflow-x-hidden">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-1">Vinca Premium</h2>
                    <p className="text-base text-muted-foreground">Yearly subscription • Save 20%</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">₹2,500</span>
                    <span className="text-base text-muted-foreground">/year</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-border max-w-full overflow-x-hidden">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                      <span className="text-emerald-600">{benefit.icon}</span>
                      <span className="text-sm text-muted-foreground">{benefit.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Billed yearly</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <div className="w-full max-w-full overflow-x-hidden">
            <div className="flex items-center justify-center max-w-2xl mx-auto max-w-full overflow-x-hidden">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center relative">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        currentStep === step.number 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : currentStep > step.number 
                          ? 'border-emerald-500 bg-emerald-500' 
                          : 'border-border bg-card'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <step.icon className={`w-5 h-5 ${
                          currentStep === step.number ? 'text-emerald-600' : 'text-muted-foreground'
                        }`} />
                      )}
                    </div>
                    <span className={`text-sm font-medium mt-2 ${
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-1 rounded-full ${
                        currentStep > index + 1 ? 'bg-emerald-500' : 'bg-border'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="w-full space-y-8 max-w-full overflow-x-hidden">
            {renderStepContent()}
            <div className="flex items-center gap-4">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  className="flex-1 py-4 border-border hover:bg-muted transition"
                  onClick={handlePreviousStep}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button 
                className={`flex-1 py-4 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 transition shadow-md ${
                  currentStep === 1 && !isPersonalInfoValid() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={currentStep === 3 ? handleCompletePurchase : handleNextStep}
                disabled={currentStep === 1 && !isPersonalInfoValid()}
              >
                {currentStep === 3 ? (
                  <>
                    Complete Purchase
                    <ShoppingBag className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue to {currentStep === 1 ? 'Payment' : 'Review'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
            {/* Removed Secure checkout, Money-back guarantee, Verified, and Contact support as requested */}
          </div>
        </div>
      </div>
      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}