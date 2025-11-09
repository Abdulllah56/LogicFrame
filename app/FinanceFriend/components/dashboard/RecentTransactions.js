import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "wouter";
import { format } from "date-fns";

/**
 * @typedef {object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} color
 * @property {string} icon // CSS class for an icon (e.g., Lucide, Font Awesome)
 *
 * @typedef {object} Transaction
 * @property {number} id
 * @property {string} description
 * @property {Category} category
 * @property {Date} date
 * @property {number} amount
 * @property {boolean=} isIncome
 *
 * @typedef {object} RecentTransactionsProps
 * @property {Transaction[]} transactions
 */

/**
 * Displays a list of the most recent transactions in a table format.
 * * @param {RecentTransactionsProps} props
 */
export function RecentTransactions({ transactions }) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          <Button variant="link" asChild>
            <Link href="/expenses">See All</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {/* Assuming transaction.category.icon contains an appropriate class for an icon */}
                        <i className={`${transaction.category.icon} text-blue-600`}></i>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.isIncome 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                      style={{ backgroundColor: transaction.category.color }}
                    >
                      {transaction.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {/* Ensure date is converted to Date object before formatting */}
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                    transaction.isIncome ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
