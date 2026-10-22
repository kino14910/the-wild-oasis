import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProtectedRoute from './ProtectedRoute'

const mockUser = vi.fn()

vi.mock('../features/authentication/useUser', () => ({
  useUser: () => mockUser(),
}))

vi.mock('../features/authentication/useLogout', () => ({
  useLogout: () => ({ logout: vi.fn(), isPending: false }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <ProtectedRoute>
        <p>dashboard content</p>
      </ProtectedRoute>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUser.mockReset()
  })

  it('renders a sign-in page with a link back to login when anonymous', () => {
    mockUser.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
    })

    renderGuard()

    expect(screen.getByText('protectedRoute.loginRequiredTitle')).toBeVisible()
    expect(screen.getByText('protectedRoute.loginRequiredBody')).toBeVisible()
    const link = screen.getByRole('link', {
      name: 'protectedRoute.backToLogin',
    })
    expect(link).toHaveAttribute('href', '/login')
    expect(screen.queryByText('dashboard content')).not.toBeInTheDocument()
  })

  it('renders a forbidden page with the signed-in email and a way out', () => {
    mockUser.mockReturnValue({
      user: { email: 'guest@demo.wildoasis.test', role: 'guest' },
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
    })

    renderGuard()

    expect(screen.getByText('protectedRoute.forbiddenTitle')).toBeVisible()
    expect(screen.getByText('guest@demo.wildoasis.test')).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'protectedRoute.signOutAndBack' }),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'protectedRoute.backToLogin' }),
    ).toHaveAttribute('href', '/login')
    expect(screen.queryByText('dashboard content')).not.toBeInTheDocument()
  })

  it('renders the page for an admin', () => {
    mockUser.mockReturnValue({
      user: { email: 'admin@demo.wildoasis.test', role: 'admin' },
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
    })

    renderGuard()

    expect(screen.getByText('dashboard content')).toBeVisible()
  })

  it('shows a spinner while the session is loading', () => {
    mockUser.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
    })

    const { container } = renderGuard()

    expect(screen.queryByText('dashboard content')).not.toBeInTheDocument()
    expect(
      screen.queryByText('protectedRoute.loginRequiredTitle'),
    ).not.toBeInTheDocument()
    expect(container.querySelector('div')).not.toBeNull()
  })
})
