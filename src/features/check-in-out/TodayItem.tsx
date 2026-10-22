import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import styled from 'styled-components'
import Button from '../../ui/Button'
import { Flag } from '../../ui/Flag'
import Tag from '../../ui/Tag'
import CheckoutButton from './CheckoutButton'

const StyledTodayItem = styled.li`
  display: grid;
  grid-template-columns: 9rem 2rem 1fr 7rem 9rem;
  gap: 1.2rem;
  align-items: center;

  font-size: 1.4rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:first-child {
    border-top: 1px solid var(--color-grey-100);
  }
`

const Guest = styled.div`
  font-weight: 500;
`

export default function TodayItem({
  activity: {
    id,
    status,
    numNights,
    guestName,
    guestCountryFlag,
    guestNationality,
  },
}: {
  activity: {
    id: number
    status: string
    numNights: number
    guestName: string | null
    guestCountryFlag: string | null
    guestNationality: string | null
  }
}) {
  const { t } = useTranslation()

  return (
    <StyledTodayItem>
      {status === 'confirmed' && (
        <Tag $type='green'>{t('todayItem.arriving')}</Tag>
      )}
      {status === 'checked_in' && (
        <Tag $type='blue'>{t('todayItem.departing')}</Tag>
      )}

      <Flag
        src={guestCountryFlag}
        alt={t('todayItem.flagOf', { country: guestNationality })}
      />
      <Guest>{guestName}</Guest>
      <div>{t('todayItem.nights', { count: numNights })}</div>

      {status === 'confirmed' && (
        <Button
          $size='small'
          $variation='primary'
          as={Link}
          to={`/checkin/${id}`}
        >
          {t('todayItem.checkIn')}
        </Button>
      )}
      {status === 'checked_in' && <CheckoutButton bookingId={id} />}
    </StyledTodayItem>
  )
}
