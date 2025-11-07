import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import WealthGrowthChart from '@/components/calculator/WealthGrowthChart';
import { CalculatorInputs } from '@/types/calculator';
import { ColumnDef } from '@tanstack/react-table';

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

  const columns: ColumnDef<Projection>[] = [
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => <div className="font-medium">{row.original.age}</div>,
    },
    {
      id: 'phase',
      header: 'Phase',
      cell: ({ row }) => {
        const proj = row.original;
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${proj.isInSIPPhase ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' :
            proj.isInWaitingPhase ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
              'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
            }`}>
            {getPhase(proj)}
          </span>
        );
      },
    },
    {
      accessorKey: 'amountInHand',
      header: () => <div className="text-right">Starting Amount</div>,
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.amountInHand)}</div>,
    },
    {
      accessorKey: 'monthlySIP',
      header: () => <div className="text-right">Monthly SIP</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.monthlySIP > 0 ? formatCurrency(row.original.monthlySIP) : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'monthlySWP',
      header: () => <div className="text-right">Monthly SWP</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.monthlySWP > 0 ? formatCurrency(row.original.monthlySWP) : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'returnRate',
      header: () => <div className="text-right">Return %</div>,
      cell: ({ row }) => <div className="text-right">{row.original.returnRate.toFixed(1)}%</div>,
    },
    {
      accessorKey: 'expectedCorpus',
      header: () => <div className="text-right">Ending Corpus</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold">{formatCurrency(row.original.expectedCorpus)}</div>
      ),
    },
  ];

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
      <CardContent className="min-w-0">
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
          <div className="space-y-4 max-h-[500px] overflow-y-auto min-w-0">
            <h3 className="text-base sm:text-lg font-semibold">Detailed Table</h3>
            <DataTable columns={columns} data={projections} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};