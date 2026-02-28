import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, BookOpen, TrendingUp } from 'lucide-react';
import { FoundationsChecklist } from '@/components/ffr/FoundationsChecklist';
import { FFRBandCard } from '@/components/ffr/FFRBandCard';
import { useFFR } from '@/hooks/useFFR';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancialPlanning } from './context/FinancialPlanningContext';

export function ChecklistTab() {
  const { user } = useAuth();
  const { setActiveTab } = useFinancialPlanning();
  const {
    ffrProgress,
    checklist,
    loading,
    updateChecklistItem,
    initializeUserData,
    getCurrentScores
  } = useFFR();

  useEffect(() => {
    if (user && !ffrProgress) {
      initializeUserData();
    }
  }, [user, ffrProgress]);

  const scores = getCurrentScores();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
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
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Financial Foundations Checklist</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Complete these essential steps to build your financial foundation
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current FFR Score */}
      {scores && (
        <div className="lg:max-w-md">
          <FFRBandCard scores={scores} />
        </div>
      )}

      {/* Foundations Checklist */}
      <FoundationsChecklist
        checklist={checklist}
        onItemUpdate={updateChecklistItem}
        loading={loading}
      />

      {/* Impact Information */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">How This Impacts Your FFR Score</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0"></span>
              <span><strong className="text-foreground">Foundation Score:</strong> Up to 40 points (40% of your total FFR)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0"></span>
              <span><strong className="text-foreground">Freedom Gain Points:</strong> Each completed item earns points towards your readiness</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 shrink-0"></span>
              <span><strong className="text-foreground">Next Steps:</strong> Completing foundations unlocks advanced opportunities</span>
            </p>
          </div>
        </CardContent>
      </Card>

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
              Explore Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover investment education based on your profile and goals
            </p>
            <Button variant="outline" className="cursor-pointer" onClick={() => setActiveTab('opportunities')}>
              View Opportunities
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
