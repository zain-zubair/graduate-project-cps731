// __tests__/components/AuthForm.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AuthForm from '@/app/component/authForm'
import { supabase } from '@/lib/client'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock Supabase client
jest.mock('../../lib/client', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(() => Promise.resolve({
        data: null,
        error: null
      }))
    }
  }
}))

describe('AuthForm', () => {
  let mockRouter

  beforeEach(() => {
    // Reset mocks before each test
    mockRouter = { push: jest.fn() }
    useRouter.mockImplementation(() => mockRouter)
    jest.clearAllMocks()
  })

  describe('Sign Up', () => {
    it('handles successful sign up for regular user', async () => {
      // Mock successful signup
      supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 1 } },
        error: null
      })

      render(<AuthForm role="user" />)

      // Fill in form
      fireEvent.change(screen.getByPlaceholderText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'password123' }
      })

      // Submit form
      fireEvent.click(screen.getByText(/sign up/i))

      // Check if Supabase was called correctly
      await waitFor(() => {
        expect(screen.getByText(/sign up successful/i)).toBeInTheDocument()
      })

      // Check success message
      expect(screen.getByText(/sign up successful/i)).toBeInTheDocument()

      // Check redirect
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })

    it('handles successful sign up for staff', async () => {
      supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: 1 } },
        error: null
      })

      render(<AuthForm role="staff" />)

      fireEvent.change(screen.getByPlaceholderText(/email/i), {
        target: { value: 'staff@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText(/sign up/i))

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard_staff')
      })
    })

    it('handles sign up error', async () => {
      // Mock error response
      supabase.auth.signUp.mockResolvedValueOnce({
        data: null,
        error: { message: 'Email already registered' }
      })

      render(<AuthForm role="user" />)

      fireEvent.change(screen.getByPlaceholderText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText(/sign up/i))

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/error signing up: email already registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('Sign In', () => {
    it('handles successful sign in', async () => {
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 1 } },
        error: null
      })

      render(<AuthForm role="user" />)

      fireEvent.change(screen.getByPlaceholderText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'password123' }
      })

      fireEvent.click(screen.getByText(/^sign in$/i))

      await waitFor(() => {
        expect(screen.getByText(/signed in successfully/i)).toBeInTheDocument()
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('handles sign in error', async () => {
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      render(<AuthForm role="user" />)

      fireEvent.change(screen.getByPlaceholderText(/email/i), {
        target: { value: 'wrong@example.com' }
      })
      fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'wrongpass' }
      })

      fireEvent.click(screen.getByText(/^sign in$/i))

      await waitFor(() => {
        expect(screen.getByText(/error signing in: invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('OAuth Sign In', () => {
    it('handles OAuth sign in attempt', async () => {
      const windowLocation = window.location
      render(<AuthForm role="user" />)

      fireEvent.click(screen.getByText(/sign in with google/i))

      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: `${windowLocation.origin}/dashboard`
          }
        })
      })
    })
  })
})