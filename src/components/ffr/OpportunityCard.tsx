import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText } from 'lucide-react';
import { HandoffButton } from './HandoffButton';
import type { FFROpportunity } from '@/types/ffr';

interface OpportunityCardProps {
  opportunity: FFROpportunity;
  onEducationClick?: (opportunityId: string) => void;
  onHandoffClick?: (opportunityId: string) => void;
}

export const OpportunityCard = ({ 
  opportunity, 
  onEducationClick, 
  onHandoffClick 
}: OpportunityCardProps) => {
  const getLaneColor = (lane: string) => {
    const colors: Record<string, string> = {
      'mf_education': 'bg-blue-100 text-blue-800',
      'tax_season': 'bg-green-100 text-green-800',
      'fd_ladder': 'bg-purple-100 text-purple-800',
      'aif_pms': 'bg-orange-100 text-orange-800',
      'mld_ncd': 'bg-pink-100 text-pink-800',
      'unlisted': 'bg-gray-100 text-gray-800'
    };
    return colors[lane] || 'bg-gray-100 text-gray-800';
  };

  const getLaneDisplayName = (lane: string) => {
    const names: Record<string, string> = {
      'mf_education': 'MF Education',
      'tax_season': 'Tax Season',
      'fd_ladder': 'FD Ladder',
      'aif_pms': 'AIF/PMS',
      'mld_ncd': 'MLD/NCD',
      'unlisted': 'Unlisted'
    };
    return names[lane] || lane;
  };

  const handleEducationClick = () => {
    if (onEducationClick) {
      onEducationClick(opportunity.id);
    }
  };

  const handleHandoffClick = () => {
    if (onHandoffClick) {
      onHandoffClick(opportunity.id);
    }
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{opportunity.opportunity_name}</CardTitle>
          <Badge variant="outline" className={getLaneColor(opportunity.lane)}>
            {getLaneDisplayName(opportunity.lane)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trigger Information */}
        {opportunity.trigger_conditions && Object.keys(opportunity.trigger_conditions).length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Relevant Because:</h4>
            <p className="text-xs text-blue-700">
              Based on your profile data and financial patterns
            </p>
          </div>
        )}

        {/* Why it matters for Financial Freedom */}
        <div>
          <h4 className="text-sm font-medium mb-2">Why This Matters for Financial Freedom:</h4>
          <p className="text-sm text-muted-foreground">{opportunity.why_matters}</p>
        </div>

        {/* Educational Content */}
        <div>
          <h4 className="text-sm font-medium mb-2">Learn More:</h4>
          <p className="text-sm text-muted-foreground mb-3">{opportunity.educational_content}</p>
        </div>

        {/* Eligibility Criteria */}
        {opportunity.eligibility_criteria && Object.keys(opportunity.eligibility_criteria).length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 mb-1">Eligibility:</h4>
            <p className="text-xs text-amber-700">
              Certain criteria may apply - learn more for details
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEducationClick}
            className="flex items-center gap-2 flex-1"
          >
            <BookOpen className="w-4 h-4" />
            Learn More
          </Button>
          
          <HandoffButton
            url={opportunity.partner_handoff_url}
            size="sm"
            className="flex-1"
            onHandoff={handleHandoffClick}
          >
            <span className="text-sm">Proceed via Partner</span>
          </HandoffButton>
        </div>

        {/* Documents Section */}
        <div className="pt-2 border-t">
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Official Documents:</h5>
          <div className="flex flex-wrap gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Factsheet
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <FileText className="w-3 h-3 mr-1" />
              KIM/SID
            </Button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Educational content only. Please consult authorized partner for investment decisions.
        </div>
      </CardContent>
    </Card>
  );
};