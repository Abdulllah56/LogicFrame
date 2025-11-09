import { Card, CardContent } from "../ui/card";

/**
 * @typedef {object} CategoryData
 * @property {number} id
 * @property {string} name
 * @property {number} amount
 * @property {number} percentage
 * @property {string} color
 *
 * @typedef {object} CategoryBreakdownProps
 * @property {CategoryData[]} categories
 * @property {number} total
 */

/**
 * Displays a breakdown of expenses by category.
 * * @param {CategoryBreakdownProps} props
 */
export function CategoryBreakdown({ categories, total }) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="h-3 w-3 rounded-full mr-2"
                  // Use inline style to apply the dynamic color
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  {/* Display amount formatted to two decimal places */}
                  ${category.amount.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">No expense data available</p>
          </div>
        )}

        {/* Total row for summary */}
        {categories.length > 0 && (
          <>
            <div className="w-full h-px bg-gray-200 mt-4 mb-3"></div>
            <div className="flex justify-between items-center font-bold">
              <span className="text-md text-gray-800">Total Expenses</span>
              <span className="text-md text-gray-900">${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
