import { useEffect } from 'react';
import { FoundationsChecklist } from '@/components/ffr/FoundationsChecklist';
import { FFRBandCard } from '@/components/ffr/FFRBandCard';
import { useFFR } from '@/hooks/useFFR';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FFRChecklist() {
  const { user } = useAuth();
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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border-b">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/tools/ffr/home" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to FFR Home
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Financial Foundations Checklist</h1>
          <p className="text-muted-foreground">
            Complete these essential steps to build your financial foundation and increase your FFR score
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Current FFR Score */}
        {scores && (
          <div className="lg:max-w-md">
            <FFRBandCard scores={scores} />
          </div>
        )}

        {/* Foundations Checklist */}
        <div className="grid lg:grid-cols-1 gap-8">
          <FoundationsChecklist
            checklist={checklist}
            onItemUpdate={updateChecklistItem}
            loading={loading}
          />
        </div>

        {/* Impact Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How This Impacts Your FFR Score</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• <strong>Foundation Score:</strong> Up to 40 points (40% of your total FFR)</p>
            <p>• <strong>Freedom Gain Points:</strong> Each completed item earns points towards your readiness</p>
            <p>• <strong>Next Steps:</strong> Completing foundations unlocks advanced opportunities</p>
          </div>
        </div>

        {/* Educational Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-3">Learn More</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Expand your financial knowledge with our educational modules
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/tools/ffr/learn">Browse Learning Modules</Link>
            </Button>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-3">Explore Opportunities</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Discover investment education based on your profile and goals
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/tools/ffr/opportunities">View Opportunities</Link>
            </Button>
          </div>
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