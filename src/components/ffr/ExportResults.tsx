import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FFRProgress } from '@/types/ffr';
import type { CalculationResults } from '@/types/calculator';

interface ExportResultsProps {
  ffrProgress: FFRProgress | null;
  calculatorResults: CalculationResults | null;
}

export const ExportResults = ({ ffrProgress, calculatorResults }: ExportResultsProps) => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    toast({
      title: "Export Coming Soon",
      description: "PDF export functionality will be available shortly.",
    });
  };

  const handleEmailResults = () => {
    // Placeholder for email functionality
    toast({
      title: "Email Coming Soon",
      description: "Email results functionality will be available shortly.",
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        variant="outline" 
        onClick={handleExportPDF}
        className="flex-1 min-w-[200px]"
      >
        <Download className="w-4 h-4 mr-2" />
        Export as PDF
      </Button>
      <Button 
        variant="outline" 
        onClick={handleEmailResults}
        className="flex-1 min-w-[200px]"
      >
        <Mail className="w-4 h-4 mr-2" />
        Email Results
      </Button>
    </div>
  );
};
