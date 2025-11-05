import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpen } from 'lucide-react';
import type { FFRFoundationsChecklist } from '@/types/ffr';

interface FoundationsChecklistProps {
  checklist: FFRFoundationsChecklist | null;
  onItemUpdate: (field: keyof Omit<FFRFoundationsChecklist, 'id' | 'user_id' | 'last_updated' | 'created_at'>, value: boolean) => void;
  loading?: boolean;
}

export const FoundationsChecklist = ({ checklist, onItemUpdate, loading }: FoundationsChecklistProps) => {
  const checklistItems = [
    {
      key: 'kyc_refresh' as const,
      title: 'KYC Refresh',
      description: 'Update your Know Your Customer information',
      gainPoints: 5,
      learnUrl: '/dashboard/tools/ffr/learn?topic=kyc'
    },
    {
      key: 'nomination_updated' as const,
      title: 'Nomination Updated',
      description: 'Ensure your investment nominations are current',
      gainPoints: 4,
      learnUrl: '/dashboard/tools/ffr/learn?topic=nomination'
    },
    {
      key: 'emergency_fund_baseline' as const,
      title: 'Emergency Fund Baseline',
      description: 'Establish your emergency fund foundation',
      gainPoints: 8,
      learnUrl: '/dashboard/tools/ffr/learn?topic=emergency-fund'
    },
    {
      key: 'sip_mandate_active' as const,
      title: 'SIP Mandate',
      description: 'Set up systematic investment plan mandate',
      gainPoints: 6,
      learnUrl: '/dashboard/tools/ffr/learn?topic=sip'
    },
    {
      key: 'document_vault_setup' as const,
      title: 'Document Vault',
      description: 'Organize your important financial documents',
      gainPoints: 3,
      learnUrl: '/dashboard/tools/ffr/learn?topic=documents'
    },
    {
      key: 'insurance_evidence' as const,
      title: 'Insurance Evidence',
      description: 'Verify your insurance coverage documentation',
      gainPoints: 4,
      learnUrl: '/dashboard/tools/ffr/learn?topic=insurance'
    }
  ];

  const completedItems = checklistItems.filter(item => checklist?.[item.key]).length;
  const totalItems = checklistItems.length;

  const handlePartnerHandoff = (itemTitle: string) => {
    // This would typically track the handoff and redirect to partner
    console.log(`Proceeding via Authorized Partner for: ${itemTitle}`);
    // In real implementation, this would redirect to partner URL
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Financial Foundations</span>
          <Badge variant="outline">
            {completedItems}/{totalItems} Complete
          </Badge>
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedItems / totalItems) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checklistItems.map((item) => (
          <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg border">
            <Checkbox
              checked={checklist?.[item.key] || false}
              onCheckedChange={(checked) => onItemUpdate(item.key, !!checked)}
              disabled={loading}
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{item.title}</h4>
                {checklist?.[item.key] && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    +{item.gainPoints} Freedom gain
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={item.learnUrl} className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Learn how
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handlePartnerHandoff(item.title)}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Proceed via Authorized Partner
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Total Freedom Gain Points:</strong> {checklist?.freedom_gain_points || 0}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Complete more items to increase your Financial Freedom Readiness score
          </p>
        </div>
      </CardContent>
    </Card>
  );
};