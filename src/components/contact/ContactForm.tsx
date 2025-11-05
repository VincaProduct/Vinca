import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ContactForm = () => {
  // Load Zoho Analytics Tracking Script
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'wf_anal';
    script.src = 'https://crm.zohopublic.in/crm/WebFormAnalyticsServeServlet?rid=8233220b5c6b5a2228d7169706008946c36fb1dfe58e0122719b14bd16bafdb5d1cef2e43e5e42429b655defcc9ac8dfgidd7e47756e2791d19aee822a851ce249dd4e3a8d10070130b10fcdd204c5b80a8gid8082a5548d6fae7f11bbec9369f5c6dccc08e1ac6e0979c116a5161f2e5cec6fgid1311a95c76374bacf16b78472d89f67ccaa34980af8cf6ee5d6850253f032a09&tw=dc5a6192bd66f26d00595cd032e9943e6608100dfa8a2c5bf348fb15837afbb5';
    
    // Check if script already exists
    const existingScript = document.getElementById('wf_anal');
    if (!existingScript) {
      document.head.appendChild(script);
    }
    
    return () => {
      const scriptToRemove = document.getElementById('wf_anal');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    return (window as any).checkMandatory81297000001892007();
  };

  return (
    <Card className="border-2 hover:border-primary/20 transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-semibold text-center">
          Schedule Free Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form 
          id='webform81297000001892007' 
          action='https://crm.zoho.in/crm/WebToLeadForm' 
          name='WebToLeads81297000001892007' 
          method='POST' 
          onSubmit={handleFormSubmit}
          acceptCharset='UTF-8'
          className="space-y-6"
        >
          {/* Zoho CRM Hidden Fields */}
          <input type='text' style={{ display: 'none' }} name='xnQsjsdp' value='a1b1500d5601cf05a25b2cacf2763effcc9c2bcf8660161efa26d88239af43d5' />
          <input type='hidden' name='zc_gad' id='zc_gad' value='' />
          <input type='text' style={{ display: 'none' }} name='xmIwtLD' value='98ecfdb78c1c761900c807665ab78990ed876c2d132b1b9996be0613b742030f11161c922692e42598f926ce3033db5e' />
          <input type='text' style={{ display: 'none' }} name='actionType' value='TGVhZHM=' />
          <input type='text' style={{ display: 'none' }} name='returnURL' value='https://vincawealth.com/thank-you' />
          <input type='text' style={{ display: 'none' }} name='aG9uZXlwb3Q' value='' />
          
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor='Last_Name' className="text-sm font-medium text-foreground">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input 
              type='text' 
              id='Last_Name' 
              aria-required='true' 
              aria-label='Last Name' 
              name='Last Name' 
              maxLength={80}
              className="w-full"
              placeholder="Enter your full name"
            />
          </div>
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor='Email' className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input 
              type='email' 
              data-ftype='email'
              autoComplete='email' 
              id='Email' 
              aria-required='true' 
              aria-label='Email' 
              name='Email' 
              maxLength={100}
              className="w-full"
              placeholder="Enter your email address"
            />
          </div>
          
          {/* Mobile Field */}
          <div className="space-y-2">
            <Label htmlFor='Mobile' className="text-sm font-medium text-foreground">
              Mobile <span className="text-destructive">*</span>
            </Label>
            <Input 
              type='tel' 
              id='Mobile' 
              aria-required='true' 
              aria-label='Mobile' 
              name='Mobile' 
              maxLength={30}
              className="w-full"
              placeholder="Enter your mobile number"
            />
          </div>
          
          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor='Description' className="text-sm font-medium text-foreground">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea 
              id='Description' 
              aria-required='true' 
              aria-label='Description' 
              name='Description'
              className="w-full min-h-[120px] resize-vertical"
              placeholder="Tell us about your financial goals and how we can help you..."
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type='submit' 
              id='formsubmit' 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 flex-1 sm:flex-none"
              size="lg"
            >
              Schedule Free Consultation
            </Button>
            <Button 
              type='reset' 
              variant="outline"
              className="border-input hover:bg-accent hover:text-accent-foreground px-6 py-3"
              size="lg"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Add the required JavaScript functions to the global scope
if (typeof window !== 'undefined') {
  (window as any).validateEmail81297000001892007 = function() {
    const form = document.forms['WebToLeads81297000001892007' as any];
    const emailFld = form.querySelectorAll('[data-ftype=email]');
    for (let i = 0; i < emailFld.length; i++) {
      const emailVal = (emailFld[i] as HTMLInputElement).value;
      if ((emailVal.replace(/^\s+|\s+$/g, '')).length != 0) {
        const atpos = emailVal.indexOf('@');
        const dotpos = emailVal.lastIndexOf('.');
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= emailVal.length) {
          alert('Please enter a valid email address.');
          (emailFld[i] as HTMLInputElement).focus();
          return false;
        }
      }
    }
    return true;
  };

  (window as any).checkMandatory81297000001892007 = function() {
    const mndFileds = ['Last Name', 'Email', 'Mobile', 'Description'];
    const fldLangVal = ['Name', 'Email', 'Mobile', 'Message'];
    for (let i = 0; i < mndFileds.length; i++) {
      const fieldObj = (document.forms['WebToLeads81297000001892007' as any] as any)[mndFileds[i]];
      if (fieldObj) {
        if (((fieldObj.value).replace(/^\s+|\s+$/g, '')).length == 0) {
          if (fieldObj.type == 'file') {
            alert('Please select a file to upload.');
            fieldObj.focus();
            return false;
          }
          alert(fldLangVal[i] + ' cannot be empty.');
          fieldObj.focus();
          return false;
        } else if (fieldObj.nodeName == 'SELECT') {
          if (fieldObj.options[fieldObj.selectedIndex].value == '-None-') {
            alert(fldLangVal[i] + ' cannot be none.');
            fieldObj.focus();
            return false;
          }
        } else if (fieldObj.type == 'checkbox') {
          if (fieldObj.checked == false) {
            alert('Please accept ' + fldLangVal[i]);
            fieldObj.focus();
            return false;
          }
        }
        try {
          if (fieldObj.name == 'Last Name') {
            const name = fieldObj.value;
          }
        } catch (e) {}
      }
    }
    if (!(window as any).validateEmail81297000001892007()) {
      return false;
    }
    const urlparams = new URLSearchParams(window.location.search);
    if (urlparams.has('service') && (urlparams.get('service') === 'smarturl')) {
      const webform = document.getElementById('webform81297000001892007');
      const service = urlparams.get('service');
      const smarturlfield = document.createElement('input');
      smarturlfield.setAttribute('type', 'hidden');
      smarturlfield.setAttribute('value', service || '');
      smarturlfield.setAttribute('name', 'service');
      webform?.appendChild(smarturlfield);
    }
    const submitButton = document.querySelector('.crmWebToEntityForm .formsubmit') as HTMLInputElement;
    if (submitButton) {
      submitButton.setAttribute('disabled', 'true');
    }
  };

  (window as any).tooltipShow81297000001892007 = function(el: HTMLElement) {
    const tooltip = el.nextElementSibling as HTMLElement;
    const tooltipDisplay = tooltip.style.display;
    if (tooltipDisplay == 'none') {
      const allTooltip = document.getElementsByClassName('zcwf_tooltip_over');
      for (let i = 0; i < allTooltip.length; i++) {
        (allTooltip[i] as HTMLElement).style.display = 'none';
      }
      tooltip.style.display = 'block';
    } else {
      tooltip.style.display = 'none';
    }
  };
}

export default ContactForm;
