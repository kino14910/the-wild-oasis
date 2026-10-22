import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import SignupForm from '../features/authentication/SignupForm'
import Heading from '../ui/Heading'
import Row from '../ui/Row'

const Note = styled.p`
  font-size: 1.4rem;
  color: var(--color-grey-500);
  max-width: 60rem;
  line-height: 1.6;
`

function NewUsers() {
  const { t } = useTranslation()

  return (
    <>
      <Row $type='horizontal'>
        <Heading as='h1'>{t('users.createHeading')}</Heading>
      </Row>
      <Note>{t('users.roleNote')}</Note>
      <SignupForm />
    </>
  )
}

export default NewUsers
