import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import type { SearchTerms } from "@/lib/googleAnalytics";
import { formatCurrency, formatNumber } from "./utils";
import type { RangeDays } from "./DateRangeSelector";

interface Props {
  data: SearchTerms | null;
  days: RangeDays;
}

export default function SearchTermsTable({ data, days }: Props) {
  const rows = data?.rows ?? [];
  const currencyCode = data?.currencyCode;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Search Terms</h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Top queries that triggered your ads in the last {days === 1 ? "day" : days === "all" ? 365 : days} days
        </p>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Query</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Clicks</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Impressions</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">CTR</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Cost</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.length === 0 ? (
              <TableRow>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400" colSpan={5}>
                  No search term data found. Search terms are available when your GA4 property is linked to Google Ads.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={`${row.query}-${index}`}>
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{row.query}</p>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatNumber(row.clicks)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatNumber(row.impressions)}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {row.ctr.toFixed(2)}%
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {formatCurrency(row.cost, currencyCode)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
