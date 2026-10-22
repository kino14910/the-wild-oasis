import Form from '../../ui/Form'
import FormRow from '../../ui/FormRow'
import Input from '../../ui/Input'
import Spinner from '../../ui/Spinner'
import { useSettings } from './useSettings'
import { useUpdateSetting } from './useUpdateSetting'
import { useTranslation } from 'react-i18next'

function UpdateSettingsForm() {
  const {
    isLoading,
    settings: {
      minBookingLength,
      maxBookingLength,
      maxGuestsPerBooking,
      breakfastPrice,
    } = {},
  } = useSettings()

  const { isUpdating, updateSetting } = useUpdateSetting()
  const { t } = useTranslation()

  if (isLoading) return <Spinner />

  function handleUpdate(e: React.ChangeEvent<HTMLInputElement>, key: string) {
    const raw = e.target.value
    if (raw === '') return
    const value = Number(raw)
    if (Number.isNaN(value)) return

    updateSetting({
      minBookingLength: Number(minBookingLength),
      maxBookingLength: Number(maxBookingLength),
      maxGuestsPerBooking: Number(maxGuestsPerBooking),
      breakfastPrice: Number(breakfastPrice),
      [key]: value,
    })
  }

  return (
    <Form>
      <FormRow label={t('updateSettingsForm.minNights')}>
        <Input
          type='number'
          id='min-nights'
          defaultValue={minBookingLength}
          disabled={isUpdating}
          onBlur={e => handleUpdate(e, 'minBookingLength')}
        />
      </FormRow>

      <FormRow label={t('updateSettingsForm.maxNights')}>
        <Input
          type='number'
          id='max-nights'
          defaultValue={maxBookingLength}
          disabled={isUpdating}
          onBlur={e => handleUpdate(e, 'maxBookingLength')}
        />
      </FormRow>

      <FormRow label={t('updateSettingsForm.maxGuests')}>
        <Input
          type='number'
          id='max-guests'
          defaultValue={maxGuestsPerBooking}
          disabled={isUpdating}
          onBlur={e => handleUpdate(e, 'maxGuestsPerBooking')}
        />
      </FormRow>

      <FormRow label={t('updateSettingsForm.breakfastPrice')}>
        <Input
          type='number'
          id='breakfast-price'
          defaultValue={breakfastPrice}
          disabled={isUpdating}
          onBlur={e => handleUpdate(e, 'breakfastPrice')}
        />
      </FormRow>
    </Form>
  )
}

export default UpdateSettingsForm
