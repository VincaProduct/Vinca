import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Info
} from 'lucide-react';

function WelcomeModal({ open, onClose }) {
  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h2 className="text-3xl font-bold mb-3 text-slate-900">Almost there! 🎉</h2>
        <p className="text-slate-600 mb-8">
          You're just one step away from unlocking premium features and your personalized dashboard.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-700 transition"
            onClick={() => window.location.href = '/auth'}
          >
            Continue to Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full py-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
            onClick={onClose}
          >
            Maybe Later
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-6">
          <Lock className="w-3 h-3" />
          <span>Secure checkout powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodIcon({ method }) {
  switch(method) {
    case 'UPI':
      return <Wallet className="w-5 h-5" />;
    case 'Card':
      return <CreditCard className="w-5 h-5" />;
    case 'Net Banking':
      return <Building className="w-5 h-5" />;
    default:
      return null;
  }
}

export default function BuyMembership() {
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    referral: ''
  });
  const [focusedField, setFocusedField] = useState(null);

  const benefits = [
    { icon: <Zap className="w-4 h-4" />, text: "Priority Support" },
    { icon: <Award className="w-4 h-4" />, text: "Exclusive Content" },
    { icon: <Users className="w-4 h-4" />, text: "Community Access" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background py-10 px-6 sm:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header - Left aligned, premium spacing */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Complete Your Membership</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Join thousands of satisfied members • 30-day money-back guarantee</p>
        </div>

        {/* Main Content Grid - Spacious dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: User Details + Payment (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Membership Summary Card */}
            <Card className="p-8 border border-border bg-card shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-1">Vinca Premium</h2>
                  <p className="text-base text-muted-foreground">Yearly subscription • Save 20%</p>
                </div>
                <div className="flex items-baseline gap-2 ml-auto">
                  <span className="text-4xl font-bold text-foreground">₹2,500</span>
                  <span className="text-base text-muted-foreground">/year</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-border">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                    <span className="text-emerald-600">{benefit.icon}</span>
                    <span className="text-sm text-muted-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
              <div className="hidden sm:flex items-center gap-4 mt-6 text-xs text-muted-foreground">
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
            </Card>

            {/* User Details Form */}
            <Card className="p-8 border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Your Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-foreground mb-2">Full Name <span className="text-emerald-500">*</span></label>
                  <Input name="fullName" placeholder="John Doe" type="text" required value={formData.fullName} onChange={handleInputChange} onFocus={() => setFocusedField('fullName')} onBlur={() => setFocusedField(null)} className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-base font-medium text-foreground mb-2">Email <span className="text-emerald-500">*</span></label>
                  <Input name="email" placeholder="john@example.com" type="email" required value={formData.email} onChange={handleInputChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-base font-medium text-foreground mb-2">Phone Number <span className="text-emerald-500">*</span></label>
                  <Input name="phone" placeholder="+91 98765 43210" type="tel" required value={formData.phone} onChange={handleInputChange} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-base font-medium text-foreground mb-2">Referral Code <span className="text-muted-foreground">(optional)</span></label>
                  <Input name="referral" placeholder="Enter code" type="text" value={formData.referral} onChange={handleInputChange} onFocus={() => setFocusedField('referral')} onBlur={() => setFocusedField(null)} className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-6 flex items-center gap-2"><Info className="w-3 h-3" /><span>Fields marked with * are required</span></p>
            </Card>

            {/* Payment Method Selection */}
            <Card className="p-8 border border-border bg-card shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Select Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['UPI', 'Card', 'Net Banking'].map((method, index) => (
                  <label key={method} className={`flex items-center sm:flex-col sm:text-center gap-3 sm:gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentMethod === method ? 'border-emerald-500 bg-muted' : 'border-border bg-card hover:border-emerald-200 hover:bg-muted'}`}>
                    <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 sm:order-2" />
                    <div className="flex items-center sm:flex-col gap-2 sm:gap-1 flex-1 sm:order-1">
                      <PaymentMethodIcon method={method} />
                      <span className="font-medium text-base text-foreground">{method}</span>
                    </div>
                    {paymentMethod === method && (<CheckCircle className="w-4 h-4 text-emerald-500 sm:order-3" />)}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-2"><Lock className="w-3 h-3" /><span>Your payment information is encrypted and secure</span></p>
            </Card>
          </div>

          {/* Right: Order Summary (4/12) */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="p-8 border border-border bg-card shadow-sm lg:sticky lg:top-10">
              <h3 className="font-semibold text-foreground mb-6">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Vinca Premium (Yearly)</span>
                  <span className="text-foreground font-medium">₹2,500</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground font-medium">₹0</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">₹2,500</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Billed yearly • Cancel anytime</p>
                </div>
              </div>
              <div className="mt-8">
                <Button className="w-full py-4 text-lg font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 transition shadow-md" onClick={() => setModalOpen(true)}>
                  Complete Purchase
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1"><Lock className="w-3 h-3" /><span>Secure</span></div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1"><Shield className="w-3 h-3" /><span>Protected</span></div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /><span>Verified</span></div>
              </div>
            </Card>
            <Card className="p-6 border border-border bg-muted shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">30-day money-back guarantee</p>
                  <p className="text-xs text-muted-foreground mt-1">Not satisfied? Get a full refund</p>
                </div>
              </div>
            </Card>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Need help? <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Contact support</a></p>
            </div>
          </div>
        </div>
      </div>
      {/* Modal */}
      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}