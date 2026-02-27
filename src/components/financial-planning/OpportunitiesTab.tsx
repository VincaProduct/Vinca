import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Filter, BookOpen, TrendingUp } from 'lucide-react';
import { OpportunityCard } from '@/components/ffr/OpportunityCard';
import { useFFR } from '@/hooks/useFFR';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialPlanning } from './context/FinancialPlanningContext';
import type { FFROpportunity } from '@/types/ffr';

export function OpportunitiesTab() {
  const [opportunities, setOpportunities] = useState<FFROpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { recordAction } = useFFR();
  const { setActiveTab: setParentTab } = useFinancialPlanning();

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('ffr_opportunities')
        .select('*')
        .eq('is_active', true)
        .order('lane', { ascending: true });

      if (!error && data) {
        setOpportunities(data as FFROpportunity[]);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEducationClick = async (opportunityId: string) => {
    await recordAction('education_opened', opportunityId, { source: 'opportunities_tab' }, 2);
    console.log(`Opening education for opportunity: ${opportunityId}`);
  };

  const handleHandoffClick = async (opportunityId: string) => {
    await recordAction('handoff_clicked', opportunityId, { source: 'opportunities_tab' }, 3);
    console.log(`Handoff clicked for opportunity: ${opportunityId}`);
  };

  const getLanes = () => {
    const lanes = [...new Set(opportunities.map(opp => opp.lane))];
    return lanes;
  };

  const getFilteredOpportunities = () => {
    if (activeTab === 'all') return opportunities;
    return opportunities.filter(opp => opp.lane === activeTab);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-12 bg-muted rounded-lg"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Investment Opportunities</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Explore educational content about various investment options
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Information Banner */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">How Opportunities Work</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg border bg-muted/20">
              <p className="font-medium text-foreground mb-1">1. Factual Triggers</p>
              <p className="text-xs text-muted-foreground">Opportunities appear based on your data patterns, not recommendations</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20">
              <p className="font-medium text-foreground mb-1">2. Educational Focus</p>
              <p className="text-xs text-muted-foreground">All content is for learning about investment options</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/20">
              <p className="font-medium text-foreground mb-1">3. Partner Execution</p>
              <p className="text-xs text-muted-foreground">All transactions happen through authorized partners</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Lanes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {getLanes().map(lane => (
              <TabsTrigger key={lane} value={lane} className="text-xs">
                {getLaneDisplayName(lane)}
              </TabsTrigger>
            ))}
          </TabsList>

          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <Filter className="w-3 h-3" />
            {getFilteredOpportunities().length} opportunities
          </Badge>
        </div>

        <TabsContent value={activeTab} className="space-y-6 mt-0">
          {getFilteredOpportunities().length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredOpportunities().map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onEducationClick={handleEducationClick}
                  onHandoffClick={handleHandoffClick}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <h3 className="text-lg font-medium mb-2">No Opportunities Available</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all'
                    ? 'No opportunities are currently available. Check back later or complete your foundations checklist.'
                    : `No opportunities available in the ${getLaneDisplayName(activeTab)} category.`
                  }
                </p>
                <Button variant="outline" className="cursor-pointer" onClick={() => setParentTab('checklist')}>
                  Complete Foundations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Educational Resources */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Expand Your Knowledge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Learn fundamental concepts with our 60-second explainer modules
            </p>
            <Button variant="outline" disabled className="cursor-not-allowed">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Track Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monitor your Financial Freedom Readiness score and foundations
            </p>
            <Button variant="outline" className="cursor-pointer" onClick={() => setParentTab('readiness')}>
              View FFR Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="border rounded-lg p-4 text-center bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Educational & execution-only. No investment advice. All transactions via authorized partners only.
        </p>
      </div>
    </div>
  );
}
