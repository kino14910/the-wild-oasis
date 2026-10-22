import { format, subDays } from 'date-fns'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import useDarkMode from '../../context/useDarkMode'
import Heading from '../../ui/Heading'
import DashboardBox from './DashboardBox'

const StyledSalesChart = styled(DashboardBox)`
  grid-column: 1 / -1;

  /* Hack to change grid line colors */
  & .recharts-cartesian-grid-horizontal line,
  & .recharts-cartesian-grid-vertical line {
    stroke: var(--color-grey-300);
  }
`

function SalesChart({
  dailySales,
  numDays,
}: {
  dailySales: { date: string; total: number; extras: number }[]
  numDays: number
}) {
  const { t } = useTranslation()
  const { isDarkMode } = useDarkMode()

  // The API aggregates per calendar day; days without sales are filled in
  // here so the chart shows a continuous timeline.
  const byDate = new Map(dailySales.map((day) => [day.date, day]))
  const data = Array.from({ length: numDays }, (_, index) => {
    const date = subDays(new Date(), numDays - 1 - index)
    const day = byDate.get(format(date, 'yyyy-MM-dd'))
    return {
      label: format(date, 'MMM dd'),
      totalSales: day?.total ?? 0,
      extrasSales: day?.extras ?? 0,
    }
  })

  const colors = isDarkMode
    ? {
        totalSales: { stroke: '#4f46e5', fill: '#4f46e5' },
        extrasSales: { stroke: '#22c55e', fill: '#22c55e' },
        text: '#e5e7eb',
        background: '#18212f',
      }
    : {
        totalSales: { stroke: '#4f46e5', fill: '#c7d2fe' },
        extrasSales: { stroke: '#16a34a', fill: '#dcfce7' },
        text: '#374151',
        background: '#fff',
      }

  return (
    <StyledSalesChart>
      <Heading as='h2'>
        {t('dashboard.salesChart.salesFrom')}{' '}
        {format(subDays(new Date(), numDays - 1), 'MMM dd yyyy')} &mdash;{' '}
        {format(new Date(), 'MMM dd yyyy')}
      </Heading>

      <ResponsiveContainer height={300} width='100%'>
        <AreaChart data={data}>
          <XAxis
            dataKey='label'
            tick={{ fill: colors.text }}
            tickLine={{ stroke: colors.text }}
          />
          <YAxis
            unit='$'
            tick={{ fill: colors.text }}
            tickLine={{ stroke: colors.text }}
          />
          <CartesianGrid strokeDasharray='4' />
          <Tooltip contentStyle={{ backgroundColor: colors.background }} />
          <Area
            dataKey='totalSales'
            type='monotone'
            stroke={colors.totalSales.stroke}
            fill={colors.totalSales.fill}
            strokeWidth={2}
            name={t('dashboard.salesChart.totalSales')}
            unit='$'
          />
          <Area
            dataKey='extrasSales'
            type='monotone'
            stroke={colors.extrasSales.stroke}
            fill={colors.extrasSales.fill}
            strokeWidth={2}
            name={t('dashboard.salesChart.extrasSales')}
            unit='$'
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledSalesChart>
  )
}

export default SalesChart
