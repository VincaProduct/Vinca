import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useFinancialPlanning } from '../context/FinancialPlanningContext';
import { StatusKPIBanner } from './StatusKPIBanner';
import { CorpusProjectionChart } from './CorpusProjectionChart';
import { ProjectionTable } from './ProjectionTable';
import { SmartSurplusEarlyRetirement } from './SmartSurplusEarlyRetirement';

export function FinancialReadinessTab() {
  const navigate = useNavigate();
  const {
    inputs,
    results,
    projections,
    hasCalculated,
  } = useFinancialPlanning();

  if (!hasCalculated) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <p className="text-sm text-muted-foreground mb-1">
              No financial plan yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-medium text-foreground">Edit Inputs</span> button above to enter your details and generate projections.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      {inputs && results && (
        <StatusKPIBanner inputs={inputs} results={results} projections={projections} />
      )}

      {/* Chart */}
      {projections.length > 0 && inputs && (
        <CorpusProjectionChart projections={projections} inputs={inputs} />
      )}

      {/* Table */}
      {projections.length > 0 && inputs && (
        <ProjectionTable projections={projections} inputs={inputs} />
      )}

      {/* Smart Surplus Early Retirement */}
      {projections.length > 0 && inputs && (
        <SmartSurplusEarlyRetirement inputs={inputs} />
      )}

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Talk to an Advisor</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized guidance on your plan
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/dashboard/book-wealth-manager')}
                className="cursor-pointer"
              >
                Book
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Access Your Portfolio</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage your investments
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => window.open('https://portfolio.vincawealth.com/login', '_blank', 'noopener,noreferrer')}
                className="cursor-pointer"
              >
                Open
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
