import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import useDarkMode from '../../context/useDarkMode'
import Heading from '../../ui/Heading'

const ChartBox = styled.div`
  /* Box */
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);

  padding: 2.4rem 3.2rem;
  grid-column: 3 / span 2;

  & > *:first-child {
    margin-bottom: 1.6rem;
  }

  & .recharts-pie-label-text {
    font-weight: 600;
  }
`

const startDataLight = [
  { duration: '1 night', value: 0, color: '#ef4444' },
  { duration: '2 nights', value: 0, color: '#f97316' },
  { duration: '3 nights', value: 0, color: '#eab308' },
  { duration: '4-5 nights', value: 0, color: '#84cc16' },
  { duration: '6-7 nights', value: 0, color: '#22c55e' },
  { duration: '8-14 nights', value: 0, color: '#14b8a6' },
  { duration: '15-21 nights', value: 0, color: '#3b82f6' },
  { duration: '21+ nights', value: 0, color: '#a855f7' },
]

const startDataDark = [
  { duration: '1 night', value: 0, color: '#b91c1c' },
  { duration: '2 nights', value: 0, color: '#c2410c' },
  { duration: '3 nights', value: 0, color: '#a16207' },
  { duration: '4-5 nights', value: 0, color: '#4d7c0f' },
  { duration: '6-7 nights', value: 0, color: '#15803d' },
  { duration: '8-14 nights', value: 0, color: '#0f766e' },
  { duration: '15-21 nights', value: 0, color: '#1d4ed8' },
  { duration: '21+ nights', value: 0, color: '#7e22ce' },
]

const BUCKETS: { label: string; match: (nights: number) => boolean }[] = [
  { label: '1 night', match: (n) => n === 1 },
  { label: '2 nights', match: (n) => n === 2 },
  { label: '3 nights', match: (n) => n === 3 },
  { label: '4-5 nights', match: (n) => n === 4 || n === 5 },
  { label: '6-7 nights', match: (n) => n === 6 || n === 7 },
  { label: '8-14 nights', match: (n) => n >= 8 && n <= 14 },
  { label: '15-21 nights', match: (n) => n >= 15 && n <= 21 },
  { label: '21+ nights', match: (n) => n > 21 },
]

// The API returns a per-night-count distribution; the chart groups them.
function prepareData(
  startData: typeof startDataLight,
  distribution: { nights: number; count: number }[],
) {
  const counts = new Map<string, number>()
  for (const entry of distribution) {
    const bucket = BUCKETS.find((item) => item.match(entry.nights))
    if (!bucket) continue
    counts.set(bucket.label, (counts.get(bucket.label) ?? 0) + entry.count)
  }

  return startData
    .map((item) => ({ ...item, value: counts.get(item.duration) ?? 0 }))
    .filter((item) => item.value > 0)
}

function DurationChart({
  durationDistribution,
}: {
  durationDistribution: { nights: number; count: number }[]
}) {
  const { t } = useTranslation()
  const { isDarkMode } = useDarkMode()
  const startData = isDarkMode ? startDataDark : startDataLight
  const data = prepareData(startData, durationDistribution)

  const translatedData = data.map((item) => ({
    ...item,
    duration: t(`dashboard.durationChart.duration.${item.duration}`),
  }))

  return (
    <ChartBox>
      <Heading as='h2'>{t('dashboard.durationChart.title')}</Heading>
      <ResponsiveContainer width='100%' height={240}>
        <PieChart>
          <Pie
            data={translatedData}
            nameKey='duration'
            dataKey='value'
            innerRadius={85}
            outerRadius={110}
            cx='40%'
            cy='50%'
            paddingAngle={3}
          >
            {translatedData.map((entry) => (
              <Cell
                fill={entry.color}
                stroke={entry.color}
                key={entry.duration}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign='middle'
            align='right'
            width='30%'
            layout='vertical'
            iconSize={15}
            iconType='circle'
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartBox>
  )
}

export default DurationChart
