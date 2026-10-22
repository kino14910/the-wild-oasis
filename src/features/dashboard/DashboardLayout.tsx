import styled from 'styled-components'
import { useCabins } from '../cabins/useCabins'
import Spinner from '../../ui/Spinner'
import Stats from './Stats'
import SalesChart from './SalesChart'
import DurationChart from './DurationChart'
import TodayActivity from '../check-in-out/TodayActivity'
import { useDashboardData } from './useDashboardData'

const StyledDashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto 34rem auto;
  gap: 2.4rem;
`

function DashboardLayout() {
  const { analytics, isLoading: isLoadingAnalytics, rangeDays } =
    useDashboardData()
  const { cabins, isLoading: isLoadingCabins } = useCabins()

  if (isLoadingAnalytics || isLoadingCabins || !analytics) return <Spinner />

  return (
    <StyledDashboardLayout>
      <Stats
        sales={analytics.sales}
        stays={analytics.stays}
        occupancy={analytics.occupancy}
      />
      <TodayActivity activities={analytics.todayActivity} />
      <DurationChart durationDistribution={analytics.durationDistribution} />
      <SalesChart dailySales={analytics.dailySales} numDays={rangeDays} />
    </StyledDashboardLayout>
  )
}

export default DashboardLayout
