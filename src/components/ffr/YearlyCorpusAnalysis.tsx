import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import WealthGrowthChart from '@/components/calculator/WealthGrowthChart';
import { CalculatorInputs } from '@/types/calculator';

interface Projection {
  year: number;
  yearNumber: number;
  age: number;
  amountInHand: number;
  lumpsumInvestment: number;
  monthlySIP: number;
  returnRate: number;
  monthlySWP: number;
  lumpsumWithdrawal: number;
  expectedCorpus: number;
  isInSIPPhase: boolean;
  isInWaitingPhase: boolean;
  isInSWPPhase: boolean;
}

interface YearlyCorpusAnalysisProps {
  projections: Projection[];
  inputs: CalculatorInputs;
}

export const YearlyCorpusAnalysis = ({ projections, inputs }: YearlyCorpusAnalysisProps) => {
  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
    return formatted.replace('₹', '₹ ');
  };

  const getPhase = (proj: Projection) => {
    if (proj.isInSIPPhase) return 'SIP Phase';
    if (proj.isInWaitingPhase) return 'Growth Phase';
    if (proj.isInSWPPhase) return 'Withdrawal Phase';
    return 'Unknown';
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Year-on-Year Corpus Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed projection of your wealth growth through retirement
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Visual Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visual Chart</h3>
            <WealthGrowthChart inputs={inputs} projections={projections} />
            <p className="text-xs text-muted-foreground text-center">
              Chart shows corpus growth through SIP accumulation, waiting period, and retirement withdrawals
            </p>
          </div>
          
          {/* Detailed Table */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Detailed Table</h3>
            <div className="rounded-md border overflow-x-auto max-h-[500px]">
              <table className="w-full caption-bottom text-sm min-w-[800px]">
                <thead className="sticky top-0 bg-background z-10 [&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[60px]">Age</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground min-w-[120px]">Phase</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground min-w-[120px]">Starting Amount</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground min-w-[110px]">Monthly SIP</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground min-w-[110px]">Monthly SWP</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground min-w-[80px]">Return %</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground min-w-[120px]">Ending Corpus</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {projections.map((proj) => (
                    <tr key={proj.yearNumber} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{proj.age}</td>
                      <td className="p-4 align-middle">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          proj.isInSIPPhase ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
                          proj.isInWaitingPhase ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
                        }`}>
                          {getPhase(proj)}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">{formatCurrency(proj.amountInHand)}</td>
                      <td className="p-4 align-middle text-right">{proj.monthlySIP > 0 ? formatCurrency(proj.monthlySIP) : '-'}</td>
                      <td className="p-4 align-middle text-right">{proj.monthlySWP > 0 ? formatCurrency(proj.monthlySWP) : '-'}</td>
                      <td className="p-4 align-middle text-right">{proj.returnRate.toFixed(1)}%</td>
                      <td className="p-4 align-middle text-right font-semibold">{formatCurrency(proj.expectedCorpus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
      </CardContent>
    </Card>
  );
};