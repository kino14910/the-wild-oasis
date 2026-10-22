import { format, isToday } from 'date-fns'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Table from '../../ui/Table'
import Tag from '../../ui/Tag'

import {
  HiArrowDownOnSquare,
  HiArrowUpOnSquare,
  HiEye,
  HiMiniTrash,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router'
import ConfirmDelete from '../../ui/ConfirmDelete'
import Menu from '../../ui/Menus'
import Modal from '../../ui/Modal'
import { formatCurrency, formatDistanceFromNow } from '../../utils/helpers'
import { useCheckout } from '../check-in-out/useCheckout'
import { useConfirmBooking } from './useConfirmBooking'
import { useDeleteBooking } from './useDeleteBooking'

const Cabin = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
  font-family: 'Sono';
`

const Stacked = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  & span:first-child {
    font-weight: 500;
  }

  & span:last-child {
    color: var(--color-grey-500);
    font-size: 1.2rem;
  }
`

const Amount = styled.div`
  font-family: 'Sono';
  font-weight: 500;
`

function BookingRow({
  booking: {
    id: bookingId,
    created_at,
    startDate,
    endDate,
    numNights,
    numGuests,
    totalPrice,
    status,
    guests: { fullName: guestName, email },
    cabins: { name: cabinName },
  },
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { checkout, isCheckingOut } = useCheckout()
  const { deleteBooking, isDeleting } = useDeleteBooking()
  const { confirmBooking, isConfirming } = useConfirmBooking()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const statusToTagName: Record<string, string> = {
    pending: 'blue',
    confirmed: 'gold',
    checked_in: 'green',
    checked_out: 'silver',
    cancelled: 'red',
  }

  return (
    <Table.Row>
      <Cabin>{cabinName}</Cabin>

      <Stacked>
        <span>{guestName}</span>
        <span>{email}</span>
      </Stacked>

      <Stacked>
        <span>
          {isToday(new Date(startDate))
            ? t('bookingRow.today')
            : formatDistanceFromNow(startDate)}{' '}
          &rarr; {t('bookingRow.nightStay', { count: numNights })}
        </span>
        <span>
          {format(new Date(startDate), 'MMM dd yyyy')} &mdash;{' '}
          {format(new Date(endDate), 'MMM dd yyyy')}
        </span>
      </Stacked>

      <Tag $type={statusToTagName[status]}>{status.replace('_', ' ')}</Tag>

      <Amount>{formatCurrency(totalPrice)}</Amount>

      <div>
        <Menu>
          <Menu.Button
            icon={<HiEye />}
            onClick={() => navigate(`/bookings/${bookingId}`)}
          >
            {t('bookingRow.seeDetails')}
          </Menu.Button>

          {status === 'pending' && (
            <Menu.Button
              icon={<HiArrowDownOnSquare />}
              onClick={() => confirmBooking(bookingId)}
              disabled={isConfirming}
            >
              {t('bookingRow.confirm')}
            </Menu.Button>
          )}

          {status === 'confirmed' && (
            <Menu.Button
              icon={<HiArrowDownOnSquare />}
              onClick={() => navigate(`/checkin/${bookingId}`)}
            >
              {t('bookingRow.checkIn')}
            </Menu.Button>
          )}

          {status === 'checked_in' && (
            <Menu.Button
              icon={<HiArrowUpOnSquare />}
              onClick={() => checkout(bookingId)}
              disabled={isCheckingOut}
            >
              {t('bookingRow.checkOut')}
            </Menu.Button>
          )}

          <Menu.Button
            icon={<HiMiniTrash />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {t('bookingRow.delete')}
          </Menu.Button>
        </Menu>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <ConfirmDelete
            resourceName={t('bookingRow.resourceName')}
            disabled={isDeleting}
            onConfirm={() => deleteBooking(bookingId)}
            onCloseModal={() => setIsDeleteModalOpen(false)}
          />
        </Modal>
      </div>
    </Table.Row>
  )
}

export default BookingRow
