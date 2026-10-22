import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import FileInput from '../../ui/FileInput'
import Form from '../../ui/Form'
import FormRow from '../../ui/FormRow'
import Input from '../../ui/Input'
import Textarea from '../../ui/Textarea'
import { useCreateCabin } from './useCreateCabin'
import { useEditCabin } from './useEditCabin'

const Label = styled.label`
  font-weight: 500;
`

const Error = styled.span`
  font-size: 1.4rem;
  color: var(--color-red-700);
`

type Cabin = {
  id: string
  [key: string]: any
}

function CreateCabinForm({
  cabinToEdit = {},
  onCloseModal,
}: {
  cabinToEdit?: Partial<Cabin>
  onCloseModal?: () => void
}) {
  const { t } = useTranslation()
  const { id: editId, ...editValues } = cabinToEdit
  const isEditSession = Boolean(editId)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    defaultValues: isEditSession ? editValues : {},
  })

  const { isCreating, createCabin } = useCreateCabin()
  const { isEditing, editCabin } = useEditCabin()
  const isWorking = isCreating || isEditing

  const onSubmit = (data: Record<string, any>) => {
    const image = typeof data.image === 'string' ? data.image : data.image[0]
    const payload = {
      name: String(data.name),
      maxCapacity: Number(data.maxCapacity),
      regularPrice: Number(data.regularPrice),
      discount: Number(data.discount ?? 0),
      description: String(data.description),
      image,
    }

    if (isEditSession)
      editCabin(
        { newCabinData: payload, id: Number(editId) },
        {
          onSuccess: () => {
            reset()
            onCloseModal?.()
          },
        },
      )
    else
      createCabin(
        { ...payload, image: data.image[0] },
        {
          onSuccess: () => {
            reset()
            onCloseModal?.()
          },
        },
      )
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, console.error)}
      $type={onCloseModal ? 'modal' : 'regular'}
    >
      <FormRow label={t('createCabinForm.cabinName')} error={errors.name}>
        <Input
          type='text'
          id='name'
          disabled={isWorking}
          {...register('name', { required: t('createCabinForm.required') })}
        />
      </FormRow>

      <FormRow
        label={t('createCabinForm.maxCapacity')}
        error={errors.maxCapacity}
      >
        <Input
          type='number'
          id='maxCapacity'
          disabled={isWorking}
          {...register('maxCapacity', {
            required: t('createCabinForm.required'),
            min: { value: 1, message: t('createCabinForm.minCapacity') },
          })}
        />
      </FormRow>

      <FormRow
        label={t('createCabinForm.regularPrice')}
        error={errors.regularPrice}
      >
        <Input
          type='number'
          id='regularPrice'
          disabled={isWorking}
          {...register('regularPrice', {
            required: t('createCabinForm.required'),
            min: { value: 1, message: t('createCabinForm.minPrice') },
          })}
        />
      </FormRow>

      <FormRow label={t('createCabinForm.discount')} error={errors.discount}>
        <Input
          type='number'
          id='discount'
          defaultValue={0}
          disabled={isWorking}
          {...register('discount', {
            required: t('createCabinForm.required'),
            // validate: (value) =>
            //   getValues().regularPrice >= value ||
            //   'Discount should be less than regular price',
            max: {
              value: getValues().regularPrice,
              message: t('createCabinForm.maxDiscount'),
            },
          })}
        />
      </FormRow>

      <FormRow
        label={t('createCabinForm.description')}
        error={errors.description}
      >
        <Textarea
          id='description'
          defaultValue=''
          disabled={isWorking}
          {...register('description', {
            required: t('createCabinForm.required'),
          })}
        />
      </FormRow>

      <FormRow label={t('createCabinForm.cabinPhoto')} error={errors.image}>
        <FileInput
          id='image'
          accept='image/*'
          disabled={isWorking}
          {...register('image', {
            required: isEditSession ? false : t('createCabinForm.required'),
          })}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <>
          <Button
            $variation='secondary'
            type='reset'
            disabled={isWorking}
            onClick={() => onCloseModal?.()}
          >
            {t('createCabinForm.cancel')}
          </Button>

          <Button disabled={isWorking}>
            {isEditSession
              ? t('createCabinForm.editCabin')
              : t('createCabinForm.createCabin')}
          </Button>
        </>
      </FormRow>
    </Form>
  )
}

export default CreateCabinForm
