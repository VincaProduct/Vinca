import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Filter } from 'lucide-react';
import { OpportunityCard } from '@/components/ffr/OpportunityCard';
import { useFFR } from '@/hooks/useFFR';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import type { FFROpportunity } from '@/types/ffr';

export default function FFROpportunities() {
  const [opportunities, setOpportunities] = useState<FFROpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { recordAction } = useFFR();

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
    await recordAction('education_opened', opportunityId, { source: 'opportunities_page' }, 2);
    console.log(`Opening education for opportunity: ${opportunityId}`);
  };

  const handleHandoffClick = async (opportunityId: string) => {
    await recordAction('handoff_clicked', opportunityId, { source: 'opportunities_page' }, 3);
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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/tools/ffr/home" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to FFR Home
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Investment Opportunities</h1>
          <p className="text-muted-foreground">
            Explore educational content about various investment options based on factual triggers and your financial profile
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Information Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How Opportunities Work</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <strong>1. Factual Triggers:</strong> Opportunities appear based on your data patterns, not recommendations
              </div>
              <div>
                <strong>2. Educational Focus:</strong> All content is for learning about investment options
              </div>
              <div>
                <strong>3. Partner Execution:</strong> All transactions happen through authorized partners
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Lanes */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-7 w-full max-w-4xl">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              {getLanes().map(lane => (
                <TabsTrigger key={lane} value={lane} className="text-xs">
                  {getLaneDisplayName(lane)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {getFilteredOpportunities().length} opportunities
              </Badge>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-6">
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
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/tools/ffr/checklist">Complete Foundations</Link>
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
              <CardTitle className="text-lg">Expand Your Knowledge</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Learn fundamental concepts with our 60-second explainer modules
              </p>
              <Button variant="outline" asChild>
                <Link to="/dashboard/tools/ffr/learn">Browse Learning Modules</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Track Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor your Financial Freedom Readiness score and foundations
              </p>
              <Button variant="outline" asChild>
                <Link to="/dashboard/tools/ffr/home">View FFR Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Disclaimer */}
        <div className="sticky bottom-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-sm text-amber-800 font-medium">
            📚 Educational & execution-only. No investment advice. 
            <span className="block sm:inline sm:ml-2">
              All transactions via authorized partners only.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}