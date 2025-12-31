import { Card, CardContent } from "../ui/card";

interface CategoryData {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CategoryBreakdownProps {
  categories: CategoryData[];
  total: number;
}

export function CategoryBreakdown({ categories, total }: CategoryBreakdownProps) {
  return (
    <Card className="bg-white/[0.02] rounded-xl shadow-sm border border-border backdrop-blur-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-foreground">{category.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">
                  ${category.amount.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">No expense data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
