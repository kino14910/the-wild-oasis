import {
  HiOutlineBanknotes,
  HiOutlineBriefcase,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
} from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import Stat from './Stat'
import { formatCurrency } from '../../utils/helpers'

function Stats({
  sales,
  stays,
  occupancy,
}: {
  sales: { total: number; count: number }
  stays: { count: number; nights: number }
  occupancy: { rate: number }
}) {
  const { t } = useTranslation()

  return (
    <>
      <Stat
        title={t('dashboard.stats.bookings')}
        color='blue'
        icon={<HiOutlineBriefcase />}
        value={sales.count}
      />
      <Stat
        title={t('dashboard.stats.sales')}
        color='green'
        icon={<HiOutlineBanknotes />}
        value={formatCurrency(sales.total)}
      />
      <Stat
        title={t('dashboard.stats.checkIns')}
        color='indigo'
        icon={<HiOutlineCalendarDays />}
        value={stays.count}
      />
      <Stat
        title={t('dashboard.stats.occupancyRate')}
        color='yellow'
        icon={<HiOutlineChartBar />}
        value={`${Math.round(occupancy.rate * 100)}%`}
      />
    </>
  )
}

export default Stats
