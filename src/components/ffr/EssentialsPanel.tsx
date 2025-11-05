import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Heart, 
  Wallet, 
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { FFRFoundationsChecklist } from '@/types/ffr';
import type { CalculationResults } from '@/types/calculator';

interface EssentialsPanelProps {
  checklist: FFRFoundationsChecklist | null;
  calculatorResults: CalculationResults | null;
}

interface EssentialItem {
  title: string;
  icon: React.ReactNode;
  status: 'complete' | 'needs-attention' | 'not-started';
  progress: number;
  description: string;
  actionText: string;
  actionLink: string;
}

export const EssentialsPanel = ({ checklist, calculatorResults }: EssentialsPanelProps) => {
  const essentials: EssentialItem[] = [
    {
      title: 'Life Insurance',
      icon: <Shield className="w-5 h-5" />,
      status: checklist?.insurance_evidence ? 'complete' : 'needs-attention',
      progress: checklist?.insurance_evidence ? 100 : 0,
      description: checklist?.insurance_evidence 
        ? 'Your life insurance is in place'
        : 'Protect your loved ones with adequate coverage',
      actionText: checklist?.insurance_evidence ? 'Review Coverage' : 'Get Covered',
      actionLink: '/dashboard/tools/ffr/checklist'
    },
    {
      title: 'Health Insurance',
      icon: <Heart className="w-5 h-5" />,
      status: checklist?.insurance_evidence ? 'complete' : 'needs-attention',
      progress: checklist?.insurance_evidence ? 100 : 0,
      description: checklist?.insurance_evidence
        ? 'Health coverage is active'
        : 'Secure your health with comprehensive coverage',
      actionText: checklist?.insurance_evidence ? 'Review Policy' : 'Get Started',
      actionLink: '/dashboard/tools/ffr/checklist'
    },
    {
      title: 'Emergency Fund',
      icon: <Wallet className="w-5 h-5" />,
      status: checklist?.emergency_fund_baseline ? 'complete' : 'needs-attention',
      progress: checklist?.emergency_fund_baseline ? 100 : 0,
      description: checklist?.emergency_fund_baseline
        ? `Target: ₹${calculatorResults?.emergencyFundRequired.toLocaleString('en-IN') || '0'}`
        : 'Build 6-12 months of expenses as safety net',
      actionText: checklist?.emergency_fund_baseline ? 'View Details' : 'Start Building',
      actionLink: '/dashboard/tools/ffr/checklist'
    },
    {
      title: 'Sufficient SIP',
      icon: <TrendingUp className="w-5 h-5" />,
      status: checklist?.sip_mandate_active ? 'complete' : 'needs-attention',
      progress: checklist?.sip_mandate_active ? 100 : 0,
      description: checklist?.sip_mandate_active
        ? `Current: ₹${calculatorResults?.requiredMonthlySIP.toLocaleString('en-IN') || '0'}/month`
        : `Required: ₹${calculatorResults?.requiredMonthlySIP.toLocaleString('en-IN') || '0'}/month`,
      actionText: checklist?.sip_mandate_active ? 'Optimize SIP' : 'Set Up SIP',
      actionLink: '/dashboard/tools/ffr/checklist'
    }
  ];

  const getStatusIcon = (status: EssentialItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'needs-attention':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: EssentialItem['status']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs-attention':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const completedCount = essentials.filter(e => e.status === 'complete').length;
  const overallProgress = (completedCount / essentials.length) * 100;

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Financial Essentials</CardTitle>
            <p className="text-sm text-muted-foreground">
              The four critical building blocks of your financial freedom
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {completedCount}/{essentials.length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={overallProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Overall Essentials Progress: {Math.round(overallProgress)}%
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {essentials.map((essential, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getStatusColor(essential.status)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    essential.status === 'complete' 
                      ? 'bg-green-200' 
                      : 'bg-amber-200'
                  }`}>
                    {essential.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{essential.title}</h4>
                  </div>
                </div>
                {getStatusIcon(essential.status)}
              </div>
              
              <p className="text-sm mb-3">{essential.description}</p>
              
              <div className="space-y-2">
                <Progress 
                  value={essential.progress} 
                  className="h-2"
                />
                <Button 
                  variant={essential.status === 'complete' ? 'outline' : 'default'}
                  size="sm" 
                  className="w-full"
                  asChild
                >
                  <Link to={essential.actionLink}>
                    {essential.actionText}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {completedCount < essentials.length && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Action Required:</strong> Complete {essentials.length - completedCount} more essential{essentials.length - completedCount > 1 ? 's' : ''} to strengthen your financial foundation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
