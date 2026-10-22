import styled from 'styled-components'

import Button from '../../ui/Button'
import ButtonGroup from '../../ui/ButtonGroup'
import ButtonText from '../../ui/ButtonText'
import Heading from '../../ui/Heading'
import Row from '../../ui/Row'
import Tag from '../../ui/Tag'

import { HiArrowDownOnSquare, HiArrowUpOnSquare } from 'react-icons/hi2'
import { useNavigate } from 'react-router'
import { useMoveBack } from '../../hooks/useMoveBack'
import Empty from '../../ui/Empty'
import Spinner from '../../ui/Spinner'
import { useCheckout } from '../check-in-out/useCheckout'
import { useConfirmBooking } from './useConfirmBooking'
import BookingDataBox from './BookingDataBox'
import useBooking from './useBooking'

const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`

const statusToTagName: Record<string, string> = {
  pending: 'blue',
  confirmed: 'gold',
  checked_in: 'green',
  checked_out: 'silver',
  cancelled: 'red',
}

function BookingDetail() {
  const { booking, isLoading } = useBooking()
  const { checkout, isCheckingOut } = useCheckout()
  const { confirmBooking, isConfirming } = useConfirmBooking()
  const navigate = useNavigate()
  const moveBack = useMoveBack()

  if (isLoading) return <Spinner />
  if (!booking) return <Empty resourceName='No booking found' />

  const { status, id: bookingId } = booking

  return (
    <>
      <Row $type='horizontal'>
        <HeadingGroup>
          <Heading as='h1'>Booking #{bookingId}</Heading>
          <Tag $type={statusToTagName[status]}>{status.replace('_', ' ')}</Tag>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      <ButtonGroup>
        {status === 'pending' && (
          <Button
            icon={<HiArrowDownOnSquare />}
            onClick={() => confirmBooking(bookingId)}
            disabled={isConfirming}
          >
            Confirm
          </Button>
        )}

        {status === 'confirmed' && (
          <Button
            icon={<HiArrowDownOnSquare />}
            onClick={() => navigate(`/checkin/${bookingId}`)}
          >
            Check in
          </Button>
        )}

        {status === 'checked_in' && (
          <Button
            icon={<HiArrowUpOnSquare />}
            onClick={() => checkout(bookingId)}
            disabled={isCheckingOut}
          >
            Check out
          </Button>
        )}
        <Button $variation='secondary' onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  )
}

export default BookingDetail
