import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, TableIcon } from 'lucide-react';
import { CalculatorInputs } from '@/types/calculator';
import { DetailedProjection } from '@/types/financial-planning';

interface ProjectionTableProps {
  projections: DetailedProjection[];
  inputs: CalculatorInputs;
}

export function ProjectionTable({ projections, inputs }: ProjectionTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
    return formatted.replace('₹', '₹ ');
  };

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;
  const sipEndAge = inputs.age + inputs.yearsForSIP;

  // Filter to show key years or all years
  const displayedProjections = useMemo(() => {
    if (showAllYears) return projections;

    // Show key milestones: every 5 years, plus phase transitions
    return projections.filter(p => {
      const isPhaseTransition = p.age === sipEndAge || p.age === retirementAge;
      const isMilestone = (p.age - inputs.age) % 5 === 0;
      const isFirstOrLast = p === projections[0] || p === projections[projections.length - 1];
      return isPhaseTransition || isMilestone || isFirstOrLast;
    });
  }, [projections, showAllYears, sipEndAge, retirementAge, inputs.age]);

  const getPhase = (proj: DetailedProjection) => {
    if (proj.isInSIPPhase) return { label: 'SIP Phase', color: 'bg-primary/10 text-primary' };
    if (proj.isInWaitingPhase) return { label: 'Growth Phase', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' };
    return { label: 'Withdrawal', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' };
  };

  if (!isExpanded) {
    return (
      <Card className="border-primary/30">
        <CardHeader
          className="cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-primary" />
              Year-by-Year Projection Table
            </CardTitle>
            <Button variant="ghost" size="sm">
              <ChevronDown className="w-4 h-4" />
              Expand
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed breakdown of your corpus growth and withdrawals over time
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-primary" />
            Year-by-Year Projection Table
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllYears(!showAllYears)}
            >
              {showAllYears ? 'Show Key Years' : 'Show All Years'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {showAllYears ? 'Showing all years' : 'Showing key milestones'} - Click a row for details
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Age</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead className="text-right">Starting Corpus</TableHead>
                <TableHead className="text-right">Monthly SIP</TableHead>
                <TableHead className="text-right">Monthly SWP</TableHead>
                <TableHead className="text-right">Return %</TableHead>
                <TableHead className="text-right">Ending Corpus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProjections.map((proj) => {
                const phase = getPhase(proj);
                const isNegative = proj.expectedCorpus < 0;
                return (
                  <TableRow
                    key={proj.age}
                    className={`${isNegative ? 'bg-rose-50 dark:bg-rose-950/20' : ''} ${
                      proj.age === retirementAge ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''
                    } ${proj.age === sipEndAge ? 'bg-primary/5' : ''}`}
                  >
                    <TableCell className="font-medium">{proj.age}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`text-xs ${phase.color}`}>
                        {phase.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(proj.amountInHand)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {proj.monthlySIP > 0 ? formatCurrency(proj.monthlySIP) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {proj.monthlySWP > 0 ? formatCurrency(proj.monthlySWP) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {proj.returnRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className={`text-right font-mono text-sm font-semibold ${
                      isNegative ? 'text-rose-600' : ''
                    }`}>
                      {formatCurrency(proj.expectedCorpus)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary row */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">SIP Period</p>
              <p className="font-semibold">Age {inputs.age} - {sipEndAge}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Growth Period</p>
              <p className="font-semibold">Age {sipEndAge} - {retirementAge}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Withdrawal Period</p>
              <p className="font-semibold">Age {retirementAge} - {inputs.lifeExpectancy}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Years</p>
              <p className="font-semibold">{inputs.lifeExpectancy - inputs.age} years</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
