import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '../../ui/Button'
import Form from '../../ui/Form'
import FormRow from '../../ui/FormRow'
import Input from '../../ui/Input'

import { useUpdateUser } from './useUpdateUser'
import { useUser } from './useUser'

function UpdateUserDataForm() {
  // We don't need the loading state, and can immediately use the user data, because we know that it has already been loaded at this point
  const {
    user: {
      email,
      user_metadata: { fullName: currentFullName },
    },
  } = useUser()

  const { updateUser, isUpdating } = useUpdateUser()
  const { t } = useTranslation()

  const [fullName, setFullName] = useState(currentFullName ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName) return
    updateUser(
      { fullName },
      {
        onSuccess: () => {
          setFullName(fullName)
        },
      },
    )
  }

  function handleCancel() {
    setFullName(currentFullName ?? '')
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label={t('updateUserDataForm.emailAddress')}>
        <Input value={email} disabled />
      </FormRow>

      <FormRow label={t('updateUserDataForm.fullName')}>
        <Input
          type='text'
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          id='fullName'
          disabled={isUpdating}
        />
      </FormRow>

      <FormRow>
        <>
          <Button
            type='reset'
            $variation='secondary'
            disabled={isUpdating}
            onClick={handleCancel}
          >
            {t('updateUserDataForm.cancel')}
          </Button>
          <Button disabled={isUpdating}>
            {t('updateUserDataForm.updateAccount')}
          </Button>
        </>
      </FormRow>
    </Form>
  )
}

export default UpdateUserDataForm
