import React, { useState } from "react";
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
  ArrowRight,
  CheckCircle,
  Users,
  Calendar,
  Lock,
  User,
  CreditCard as CreditCardIcon,
  ShoppingBag,
  Clock,
  ChevronLeft
} from "lucide-react";

function PaymentMethodIcon({ method }) {
  switch (method) {
    case "UPI":
      return <Wallet className="w-5 h-5 text-muted-foreground" />;
    case "Card":
      return <CreditCard className="w-5 h-5 text-muted-foreground" />;
    case "Net Banking":
      return <Building className="w-5 h-5 text-muted-foreground" />;
    default:
      return null;
  }
}

function WelcomeModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-sm w-full border border-border" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-medium mb-3 text-foreground">Welcome to Vinca</h2>
        <p className="text-muted-foreground mb-8">
          Your financial readiness journey begins now. We'll guide you through every step.
        </p>
        <div className="flex flex-col gap-3">
          <Button className="w-full bg-emerald-600 text-white font-medium py-3 rounded-lg hover:bg-emerald-700 transition" onClick={() => window.location.href = '/auth'}>
            Continue to Dashboard
          </Button>
          <Button variant="outline" className="w-full py-3 rounded-lg border-border text-muted-foreground hover:bg-muted" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
          <Lock className="w-3 h-3" />
          <span>Secured by Vinca</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardBuyMembershipPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    referral: ""
  });

  const steps = [
    { number: 1, title: "Your details" },
    { number: 2, title: "Payment method" },
    { number: 3, title: "Confirm setup" }
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
          <Card className="w-full p-8 border-border bg-card rounded-xl">
            <div className="mb-6">
              <p className="text-muted-foreground text-sm">
                We use this information to personalise your financial planning experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full name <span className="text-muted-foreground">*</span></label>
                <Input 
                  name="fullName" 
                  placeholder="John Doe" 
                  type="text" 
                  required 
                  value={formData.fullName} 
                  onChange={handleInputChange} 
                  className="h-12 border-border focus:border-muted-foreground focus:ring-0 rounded-lg px-4 bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email <span className="text-muted-foreground">*</span></label>
                <Input 
                  name="email" 
                  placeholder="john@example.com" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="h-12 border-border focus:border-muted-foreground focus:ring-0 rounded-lg px-4 bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone number <span className="text-muted-foreground">*</span></label>
                <Input 
                  name="phone" 
                  placeholder="+91 98765 43210" 
                  type="tel" 
                  required 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className="h-12 border-border focus:border-muted-foreground focus:ring-0 rounded-lg px-4 bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Referral code <span className="text-muted-foreground">(optional)</span></label>
                <Input 
                  name="referral" 
                  placeholder="Enter code" 
                  type="text" 
                  value={formData.referral} 
                  onChange={handleInputChange} 
                  className="h-12 border-border focus:border-muted-foreground focus:ring-0 rounded-lg px-4 bg-background"
                />
              </div>
            </div>
          </Card>
        );
      
      case 2:
        return (
          <Card className="w-full p-8 border-border bg-card rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["UPI", "Card", "Net Banking"].map((method) => (
                <label 
                  key={method} 
                  className={`flex items-center gap-3 p-5 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === method 
                      ? 'border-muted-foreground bg-muted' 
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method} 
                    checked={paymentMethod === method} 
                    onChange={() => setPaymentMethod(method)} 
                    className="w-4 h-4 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <div className="flex items-center gap-2">
                    <PaymentMethodIcon method={method} />
                    <span className="font-medium text-foreground">{method}</span>
                  </div>
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
          <Card className="w-full p-8 border-border bg-card rounded-xl">
            <h3 className="text-lg font-medium text-foreground mb-6">Review your selections</h3>
            
            <div className="space-y-6">
              <div className="bg-muted p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">Personal information</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="text-foreground">{formData.fullName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="text-foreground">{formData.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="text-foreground">{formData.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Referral</p>
                    <p className="text-foreground">{formData.referral || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">Payment method</h4>
                </div>
                <div className="flex items-center gap-2">
                  <PaymentMethodIcon method={paymentMethod} />
                  <span className="text-foreground">{paymentMethod}</span>
                </div>
              </div>

              <div className="bg-muted p-5 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-foreground">Subscription</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-foreground">Vinca Premium</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing</span>
                    <span className="text-foreground">Annual</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-foreground font-medium">₹2,500/year</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader title="Complete your membership setup" />
      
      <div className="w-full px-6 sm:px-8 lg:px-12 py-12">
        <div className="w-full max-w-4xl mx-auto space-y-12">
          
          {/* Main subscription card - calm and informative */}
          <Card className="w-full p-8 border-border bg-card rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-medium text-foreground mb-2">
                  Your Financial Readiness Subscription
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                  This membership unlocks structured tools, guided workflows, and expert-backed systems designed to help you make confident financial decisions over time.
                </p>
                
                <div className="flex items-center gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Annual billing</span>
                  </div>
                  <span className="text-border">|</span>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cancel anytime</span>
                  </div>
                </div>
              </div>
              <div className="lg:text-right">
                <span className="text-2xl font-medium text-foreground">₹2,500</span>
                <span className="text-muted-foreground text-sm ml-1">/year</span>
              </div>
            </div>
          </Card>

          {/* Step indicator - minimal and calm */}
          <div className="w-full">
            <div className="flex items-center justify-center max-w-xl mx-auto">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        currentStep === step.number 
                          ? 'bg-emerald-100 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800' 
                          : currentStep > step.number 
                          ? 'bg-emerald-100 dark:bg-emerald-950/30' 
                          : 'bg-muted'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className={`text-sm ${
                          currentStep === step.number ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                        }`}>
                          {step.number}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-3">
                      <div className="h-px bg-border" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
          </div>

          {/* Dynamic step content */}
          <div className="w-full space-y-8">
            {renderStepContent()}

            {/* Navigation buttons - calm and minimal */}
            <div className="flex items-center gap-4 pt-4">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  className="flex-1 py-4 border-border text-muted-foreground hover:bg-muted rounded-lg"
                  onClick={handlePreviousStep}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button 
                className={`flex-1 py-4 text-base font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white ${
                  currentStep === 1 && !isPersonalInfoValid() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={currentStep === 3 ? handleCompletePurchase : handleNextStep}
                disabled={currentStep === 1 && !isPersonalInfoValid()}
              >
                {currentStep === 3 ? (
                  <>
                    Confirm subscription
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}