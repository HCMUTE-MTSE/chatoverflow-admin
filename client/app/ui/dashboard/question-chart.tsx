import { fetchDashboardStats } from '@/app/lib/data';
import { CalendarIcon } from 'lucide-react';
import { lusitana } from '../fonts';

function generateYAxis(data: { month: string; count: number }[]) {
   const maxCount = Math.max(...data.map((item) => item.count), 0);
   const topLabel = Math.ceil(maxCount / 10) * 10 || 10;

   const yAxisLabels = [];
   for (let i = topLabel; i >= 0; i -= topLabel / 5) {
      yAxisLabels.push(i);
   }

   return { yAxisLabels, topLabel };
}

export default async function QuestionChart() {
   const { questionsByMonth } = await fetchDashboardStats();

   const chartHeight = 350;
   const { yAxisLabels, topLabel } = generateYAxis(questionsByMonth);

   if (!questionsByMonth || questionsByMonth.length === 0) {
      return <p className="mt-4 text-gray-400">No data available.</p>;
   }

   return (
      <div className="w-full md:col-span-4">
         <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
            Questions Activity
         </h2>

         <div className="rounded-xl bg-gray-50 p-4">
            <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
               <div
                  className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
                  style={{ height: `${chartHeight}px` }}
               >
                  {yAxisLabels.map((label) => (
                     <p key={label}>{label}</p>
                  ))}
               </div>

               {questionsByMonth.map((month) => (
                  <div
                     key={month.month}
                     className="flex flex-col items-center gap-2"
                  >
                     <div
                        className="w-full rounded-md bg-blue-300"
                        style={{
                           height: `${
                              (chartHeight / topLabel) * month.count
                           }px`,
                        }}
                     ></div>
                     <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                        {month.month}
                     </p>
                  </div>
               ))}
            </div>
            <div className="flex items-center pb-2 pt-6">
               <CalendarIcon className="h-5 w-5 text-gray-500" />
               <h3 className="ml-2 text-sm text-gray-500">Last 12 months</h3>
            </div>
         </div>
      </div>
   );
}
