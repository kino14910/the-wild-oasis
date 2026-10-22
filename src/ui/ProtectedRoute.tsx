import { Link } from 'react-router'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useUser } from '../features/authentication/useUser'
import { useLogout } from '../features/authentication/useLogout'
import Button from './Button'
import Spinner from './Spinner'

const FullPage = styled.div`
  height: 100vh;
  background-color: var(--color-grey-50);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.4rem;
`

const Card = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-100);
  border-radius: var(--border-radius-md);
  padding: 4.8rem 4rem;
  max-width: 52rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  text-align: center;
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-grey-800);
`

const Body = styled.p`
  font-size: 1.4rem;
  line-height: 1.7;
  color: var(--color-grey-500);
`

const Email = styled.span`
  font-family: 'Sono';
  font-weight: 600;
  color: var(--color-grey-700);
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  justify-content: center;
  margin-top: 0.8rem;
`

// Route-level guard only; every admin API enforces the role server-side.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, isAdmin } = useUser()
  const { logout, isPending } = useLogout()
  const { t } = useTranslation()

  if (isLoading)
    return (
      <FullPage>
        <Spinner />
      </FullPage>
    )

  if (!isAuthenticated) {
    return (
      <FullPage>
        <Card>
          <Title>{t('protectedRoute.loginRequiredTitle')}</Title>
          <Body>{t('protectedRoute.loginRequiredBody')}</Body>
          <Actions>
            <Button as={Link} to='/login'>
              {t('protectedRoute.backToLogin')}
            </Button>
          </Actions>
        </Card>
      </FullPage>
    )
  }

  if (!isAdmin) {
    return (
      <FullPage>
        <Card>
          <Title>{t('protectedRoute.forbiddenTitle')}</Title>
          <Body>
            {t('protectedRoute.forbiddenBodyBefore')}{' '}
            <Email>{user?.email ?? '-'}</Email>{' '}
            {t('protectedRoute.forbiddenBodyAfter')}
          </Body>
          <Actions>
            <Button onClick={() => logout()} disabled={isPending}>
              {t('protectedRoute.signOutAndBack')}
            </Button>
            <Button $variation='secondary' as={Link} to='/login'>
              {t('protectedRoute.backToLogin')}
            </Button>
          </Actions>
        </Card>
      </FullPage>
    )
  }

  return children
}

export default ProtectedRoute
