import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings2, Calculator, Heart, Wallet } from 'lucide-react';
import { FinancialPlanningProvider, useFinancialPlanning, defaultInputs } from '@/components/financial-planning/context/FinancialPlanningContext';
import { FinancialReadinessTab } from '@/components/financial-planning/financial-readiness/FinancialReadinessTab';
import { LifestylePlannerTab } from '@/components/financial-planning/lifestyle-planner/LifestylePlannerTab';
import { HealthStressTab } from '@/components/financial-planning/health-stress/HealthStressTab';
import TimelineCalculatorForm from '@/components/calculator/TimelineCalculatorForm';
import { toast } from 'sonner';
import { CalculatorInputs } from '@/types/calculator';
import CanonicalPageHeader from '@/components/ui/CanonicalPageHeader';

function FFRContent() {
  const {
    inputs,
    isLoading,
    hasCalculated,
    activeTab,
    setActiveTab,
    setInputs,
  } = useFinancialPlanning();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedInputs, setEditedInputs] = useState<CalculatorInputs | null>(null);

  const handleOpenEdit = () => {
    setEditedInputs({ ...(inputs || defaultInputs) });
    setIsEditOpen(true);
  };

  const handleCalculate = async () => {
    if (!editedInputs) return;
    await setInputs(editedInputs);
    setIsEditOpen(false);
    toast.success('Plan updated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CanonicalPageHeader 
          title="Comprehensive tools for retirement planning" 
        />
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const editButton = (
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogTrigger asChild>
        {/* Desktop: icon + text, Mobile: icon only */}
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer gap-2"
          onClick={handleOpenEdit}
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden md:inline">{hasCalculated ? 'Edit Inputs' : 'Enter Inputs'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Financial Plan</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {editedInputs && (
            <TimelineCalculatorForm
              inputs={editedInputs}
              onInputChange={setEditedInputs}
              onCalculate={handleCalculate}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <CanonicalPageHeader 
        title="Comprehensive tools for retirement planning"
        actions={editButton}
        mobileActionButton={editButton}
      />
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-6 overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="readiness"
              className="flex items-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Financial Readiness</span>
              <span className="sm:hidden">Readiness</span>
            </TabsTrigger>
            <TabsTrigger
              value="lifestyle"
              className="flex items-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Lifestyle Planner</span>
              <span className="sm:hidden">Lifestyle</span>
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className="flex items-center gap-2 px-4 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Health Analysis</span>
              <span className="sm:hidden">Health</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readiness" className="mt-0">
            <FinancialReadinessTab />
          </TabsContent>

          <TabsContent value="lifestyle" className="mt-0">
            <LifestylePlannerTab />
          </TabsContent>

          <TabsContent value="health" className="mt-0">
            <HealthStressTab />
          </TabsContent>
        </Tabs>

        {/* Footer note */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Educational platform. No investment advice provided. All transactions via authorized partners.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedFFRPage() {
  return (
    <FinancialPlanningProvider>
      <FFRContent />
    </FinancialPlanningProvider>
  );
}