'use client';

import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ExpenseChart({ data, period, onPeriodChange, onDateRangeChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Format tooltip to show currency
  const formatTooltip = (value) => {
    return `$${Number(value).toFixed(2)}`;
  };

  // Move date range forward
  const moveForward = () => {
    const newDate = new Date(currentDate);
    if (period === "day") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (period === "week") {
      newDate.setDate(newDate.getDate() + 28);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Move date range backward
  const moveBackward = () => {
    const newDate = new Date(currentDate);
    if (period === "day") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (period === "week") {
      newDate.setDate(newDate.getDate() - 28);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Update parent with new date range
  useEffect(() => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);

    if (period === "day") {
      startDate.setDate(startDate.getDate() - 3);
      endDate.setDate(endDate.getDate() + 3);
    } else if (period === "week") {
      startDate.setDate(1); // First day of month
      endDate.setMonth(endDate.getMonth() + 1, 0); // Last day of month
    } else {
      // Month: show last 6 months
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
    }

    onDateRangeChange(startDate, endDate);
  }, [period, currentDate, onDateRangeChange]);

  // Get readable date range text
  const getDateRangeText = () => {
    const options = { month: "long", year: "numeric" };
    if (period === "day" || period === "week") {
      return currentDate.toLocaleDateString("en-US", options);
    } else {
      return currentDate.toLocaleDateString("en-US", { year: "numeric" });
    }
  };

  return (
    <Card className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 sm:mb-0">
            Spending by Category
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full sm:w-auto">
            {/* Period Tabs */}
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                className={`
                  px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg 
                  hover:bg-gray-100 focus:z-10 focus:text-primary-600
                  ${period === "day" ? "bg-gray-100 font-semibold" : ""}
                `}
                onClick={() => onPeriodChange("day")}
              >
                Day
              </button>
              <button
                className={`
                  px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 
                  hover:bg-gray-100 focus:z-10 focus:text-primary-600
                  ${period === "week" ? "bg-gray-100 font-semibold" : ""}
                `}
                onClick={() => onPeriodChange("week")}
              >
                Week
              </button>
              <button
                className={`
                  px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-lg 
                  hover:bg-gray-100 focus:z-10 focus:text-primary-600
                  ${period === "month" ? "bg-gray-100 font-semibold" : ""}
                `}
                onClick={() => onPeriodChange("month")}
              >
                Month
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center space-x-2 sm:ml-4">
              <button
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={moveBackward}
              >
                <i className="ri-arrow-left-s-line text-lg"></i>
              </button>
              <span className="text-sm font-medium whitespace-nowrap">
                {getDateRangeText()}
              </span>
              <button
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={moveForward}
              >
                <i className="ri-arrow-right-s-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "#0F172A",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "white",
                }}
                itemStyle={{ color: "white" }}
                labelStyle={{ color: "white", fontWeight: "bold" }}
              />
              <Bar
                dataKey="amount"
                fill="#38BDF8"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                name="Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}