import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CalculatorInputs, CalculationResults } from "@/types/calculator";

interface UserLumpsumData {
  [yearNumber: number]: {
    investment: number;
    withdrawal: number;
  };
}

interface ProjectionRow {
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
}

interface DetailedProjectionTableProps {
  inputs: CalculatorInputs;
  results: CalculationResults;
  userLumpsumData: UserLumpsumData;
  setUserLumpsumData: (
    data: UserLumpsumData | ((prev: UserLumpsumData) => UserLumpsumData)
  ) => void;
  projections: ProjectionRow[];
}

const DetailedProjectionTable: React.FC<DetailedProjectionTableProps> = ({
  inputs,
  results,
  userLumpsumData,
  setUserLumpsumData,
  projections,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleLumpsumChange = (
    yearNumber: number,
    type: "investment" | "withdrawal",
    value: string
  ) => {
    const numericValue = parseFloat(value) || 0;
    setUserLumpsumData((prev) => ({
      ...prev,
      [yearNumber]: {
        ...prev[yearNumber],
        [type]: numericValue,
      },
    }));
  };

  const getUserLumpsumValue = (
    yearNumber: number,
    type: "investment" | "withdrawal"
  ) => {
    return userLumpsumData[yearNumber]?.[type] || 0;
  };

  // Generate detailed projections with user input

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Year-by-Year Projection</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete breakdown starting from year 1 showing SIP phase, waiting
          period, and SWP phase with all cash flows. You can add custom lumpsum
          investments or withdrawals for any year.
        </p>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Year No.</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Amount in Hand</TableHead>
                <TableHead>Lumpsum Investment</TableHead>
                <TableHead>Monthly SIP</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Monthly SWP</TableHead>
                <TableHead>Lumpsum Withdrawal</TableHead>
                <TableHead>Expected Corpus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projections.map((projection, index) => (
                <TableRow
                  key={index}
                  className={`
                    ${
                      projection.expectedCorpus < 0
                        ? "bg-red-50 text-red-700"
                        : ""
                    }
                    ${projection.monthlySWP > 0 ? "bg-blue-50" : ""}
                    ${projection.lumpsumInvestment > 0 ? "bg-yellow-50" : ""}
                    ${
                      projection.yearNumber === 1
                        ? "bg-green-50 font-medium"
                        : ""
                    }
                  `}
                >
                  <TableCell className="font-medium">
                    {projection.year}
                  </TableCell>
                  <TableCell>{projection.yearNumber}</TableCell>
                  <TableCell>{projection.age}</TableCell>
                  <TableCell>
                    {formatCurrency(projection.amountInHand)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={getUserLumpsumValue(
                        projection.yearNumber,
                        "investment"
                      )}
                      onChange={(e) =>
                        handleLumpsumChange(
                          projection.yearNumber,
                          "investment",
                          e.target.value
                        )
                      }
                      className="w-24 h-8 text-xs"
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    {projection.monthlySIP > 0
                      ? formatCurrency(projection.monthlySIP)
                      : "₹0"}
                  </TableCell>
                  <TableCell>{projection.returnRate.toFixed(0)}%</TableCell>
                  <TableCell>
                    {projection.monthlySWP > 0
                      ? formatCurrency(projection.monthlySWP)
                      : "₹0"}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={getUserLumpsumValue(
                        projection.yearNumber,
                        "withdrawal"
                      )}
                      onChange={(e) =>
                        handleLumpsumChange(
                          projection.yearNumber,
                          "withdrawal",
                          e.target.value
                        )
                      }
                      className="w-24 h-8 text-xs"
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell
                    className={
                      projection.expectedCorpus < 0
                        ? "font-bold text-red-600"
                        : "font-medium"
                    }
                  >
                    {projection.expectedCorpus < 0 ? "-" : ""}
                    {formatCurrency(projection.expectedCorpus)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 rounded border"></div>
            <span>First Year</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 rounded"></div>
            <span>Years with Lumpsum Investment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 rounded"></div>
            <span>SWP Phase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 rounded"></div>
            <span>Corpus Depletion</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailedProjectionTable;
