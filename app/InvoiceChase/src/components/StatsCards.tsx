import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  totalUnpaid: number;
  overdueCount: number;
  paidThisMonth: number;
}

export const StatsCards = ({ totalUnpaid, overdueCount, paidThisMonth }: StatsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(totalUnpaid)}</div>
          <p className="text-xs text-muted-foreground mt-1">Outstanding amount to collect</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-destructive">{overdueCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Invoices past their due date</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-500">{formatCurrency(paidThisMonth)}</div>
          <p className="text-xs text-muted-foreground mt-1">Revenue collected this month</p>
        </CardContent>
      </Card>
    </div>
  );
};
