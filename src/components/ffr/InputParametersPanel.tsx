import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";
import { Edit, Calendar, TrendingUp, PiggyBank, Home, Target, DollarSign } from "lucide-react";
import { useState } from "react";
import TimelineCalculatorForm from "@/components/calculator/TimelineCalculatorForm";
import { calculateFinancialFreedom } from "@/utils/calculatorUtils";
import { toast } from "sonner";

interface InputParametersPanelProps {
  inputs: CalculatorInputs;
  onInputsUpdate: (inputs: CalculatorInputs, results: CalculationResults) => void;
}

export function InputParametersPanel({ inputs, onInputsUpdate }: InputParametersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedInputs, setEditedInputs] = useState<CalculatorInputs>(inputs);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)} K`;
    }
    return `₹${value}`;
  };

  const handleCalculate = () => {
    const newResults = calculateFinancialFreedom(editedInputs);
    
    // Store in localStorage
    localStorage.setItem('financial_calculator_inputs', JSON.stringify(editedInputs));
    localStorage.setItem('financial_calculator_results', JSON.stringify(newResults));
    
    // Update parent component
    onInputsUpdate(editedInputs, newResults);
    
    setIsOpen(false);
    toast.success("Your financial plan has been updated!");
  };

  const retirementAge = inputs.age + inputs.yearsForSIP + inputs.waitingYearsBeforeSWP;

  const parameters = [
    {
      icon: Calendar,
      label: "Current Age",
      value: `${inputs.age} years`,
      color: "text-primary"
    },
    {
      icon: Target,
      label: "Retirement Age",
      value: `${retirementAge} years`,
      color: "text-accent"
    },
    {
      icon: Calendar,
      label: "Life Expectancy",
      value: `${inputs.lifeExpectancy} years`,
      color: "text-primary"
    },
    {
      icon: PiggyBank,
      label: "Existing Corpus",
      value: formatCurrency(inputs.initialPortfolioValue),
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: TrendingUp,
      label: "Monthly SIP",
      value: formatCurrency(inputs.sipAmount),
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Calendar,
      label: "SIP Duration",
      value: `${inputs.yearsForSIP} years`,
      color: "text-primary"
    },
    {
      icon: DollarSign,
      label: "Expected Return (SIP)",
      value: `${inputs.returnDuringSIPAndWaiting}%`,
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      label: "SIP Growth Rate",
      value: `${inputs.growthInSIP}%`,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Home,
      label: "Current Monthly Expenses",
      value: formatCurrency(inputs.currentMonthlyExpenses),
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: DollarSign,
      label: "Expected Inflation",
      value: `${inputs.inflation}%`,
      color: "text-red-600 dark:text-red-400"
    },
    {
      icon: Calendar,
      label: "Waiting Years Before Withdrawal",
      value: `${inputs.waitingYearsBeforeSWP} years`,
      color: "text-primary"
    },
    {
      icon: DollarSign,
      label: "Expected Return (Withdrawal)",
      value: `${inputs.returnDuringSWP}%`,
      color: "text-accent"
    },
    {
      icon: TrendingUp,
      label: "Withdrawal Growth Rate",
      value: `${inputs.growthInSWP}%`,
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your Calculation Parameters</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              The inputs used for your financial freedom calculation
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Inputs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Your Financial Plan</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <TimelineCalculatorForm
                  inputs={editedInputs}
                  onInputChange={setEditedInputs}
                  onCalculate={handleCalculate}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parameters.map((param, index) => {
            const Icon = param.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border">
                    <Icon className={`w-5 h-5 ${param.color}`} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {param.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {param.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
