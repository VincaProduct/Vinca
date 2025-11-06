import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Heart, 
  Wallet, 
  TrendingUp,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import type { FFRFoundationsChecklist } from '@/types/ffr';
import type { CalculationResults } from '@/types/calculator';

interface EssentialsPanelProps {
  checklist: FFRFoundationsChecklist | null;
  calculatorResults: CalculationResults | null;
}

interface EssentialItem {
  title: string;
  icon: React.ReactNode;
  status: 'complete' | 'incomplete';
  value: string;
  description: string;
}

export const EssentialsPanel = ({ checklist, calculatorResults }: EssentialsPanelProps) => {
  const essentials: EssentialItem[] = [
    {
      title: 'Life Insurance',
      icon: <Shield className="w-5 h-5" />,
      status: checklist?.insurance_evidence ? 'complete' : 'incomplete',
      value: '10x Annual Income',
      description: 'Protects your loved ones financially in case of unforeseen events'
    },
    {
      title: 'Health Insurance',
      icon: <Heart className="w-5 h-5" />,
      status: checklist?.insurance_evidence ? 'complete' : 'incomplete',
      value: '50% of Annual Income',
      description: 'Comprehensive health coverage for medical emergencies'
    },
    {
      title: 'Emergency Fund',
      icon: <Wallet className="w-5 h-5" />,
      status: checklist?.emergency_fund_baseline ? 'complete' : 'incomplete',
      value: `₹${calculatorResults?.emergencyFundRequired.toLocaleString('en-IN') || '0'}`,
      description: '6-12 months of expenses as a financial safety net'
    },
    {
      title: 'Required Monthly SIP',
      icon: <TrendingUp className="w-5 h-5" />,
      status: checklist?.sip_mandate_active ? 'complete' : 'incomplete',
      value: `₹${calculatorResults?.requiredMonthlySIP.toLocaleString('en-IN') || '0'}/month`,
      description: 'Systematic investment for long-term wealth creation'
    }
  ];

  const completedCount = essentials.filter(e => e.status === 'complete').length;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {essentials.map((essential, index) => (
        <Card 
          key={index}
          className="border border-border/40 hover:border-primary/30 transition-all"
        >
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                essential.status === 'complete' 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}>
                {essential.icon}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-base">{essential.title}</h4>
                  {essential.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {essential.description}
                </p>
                
                <div className="pt-2">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    essential.status === 'complete'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {essential.value}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
