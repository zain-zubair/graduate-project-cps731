import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProgressForm from '@/app/dashboard/[id]/student-form'
import { supabase } from '@/lib/client'

// Mock Supabase client
jest.mock('../lib/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(),
    })),
  },
}))

describe('ProgressForm', () => {
  const mockAlert = jest.fn()

  beforeAll(() => {
    jest.spyOn(window, 'alert').mockImplementation(mockAlert)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('3.1 Upload form with valid format', async () => {
    supabase.from().insert.mockResolvedValueOnce({ error: null })

    render(<ProgressForm studentId="123" supervisorId="456" />)

    fireEvent.change(screen.getByLabelText(/Term/i), {
      target: { value: 'Fall 2024' },
    })
    fireEvent.change(screen.getByLabelText(/Start Term/i), {
      target: { value: 'Spring 2023' },
    })
    fireEvent.change(screen.getByLabelText(/Program/i), {
      target: { value: 'Computer Science' },
    })
    fireEvent.change(screen.getByLabelText(/Degree/i), {
      target: { value: 'Masters' },
    })
    fireEvent.change(screen.getByLabelText(/Year of Study/i), {
      target: { value: 2 },
    })
    fireEvent.change(screen.getByLabelText(/Supervisor Name/i), {
      target: { value: 'Dr. Smith' },
    })
    fireEvent.change(screen.getByLabelText(/Student Signature/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/Signature Date/i), {
      target: { value: '2024-01-01' },
    })

    fireEvent.click(screen.getByText(/Submit/i))

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Form submitted successfully!')
    })
  })

  it('3.2 Upload form with invalid format', async () => {
    supabase
      .from()
      .insert.mockResolvedValueOnce({ error: { message: 'Invalid format' } })

    render(<ProgressForm studentId="123" supervisorId="456" />)

    fireEvent.change(screen.getByLabelText(/Term/i), { target: { value: '' } }) // Missing required field
    fireEvent.change(screen.getByLabelText(/Start Term/i), {
      target: { value: 'Spring 2023' },
    })

    fireEvent.click(screen.getByText(/Submit/i))

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Error submitting form.')
    })
  })

  it('3.3 Upload form while not being assigned to a supervisor', async () => {
    render(<ProgressForm studentId="123" supervisorId="" />)

    fireEvent.change(screen.getByLabelText(/Term/i), {
      target: { value: 'Fall 2024' },
    })
    fireEvent.change(screen.getByLabelText(/Start Term/i), {
      target: { value: 'Spring 2023' },
    })

    fireEvent.click(screen.getByText(/Submit/i))

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'Cannot submit progress form if you have no assigned supervisor.'
      )
    })
  })

  it('3.4 Submit completed form for review', async () => {
    supabase.from().insert.mockResolvedValueOnce({ error: null })

    render(<ProgressForm studentId="123" supervisorId="456" />)

    fireEvent.change(screen.getByLabelText(/Term/i), {
      target: { value: 'Fall 2024' },
    })
    fireEvent.change(screen.getByLabelText(/Start Term/i), {
      target: { value: 'Spring 2023' },
    })
    fireEvent.change(screen.getByLabelText(/Program/i), {
      target: { value: 'Computer Science' },
    })
    fireEvent.change(screen.getByLabelText(/Degree/i), {
      target: { value: 'Masters' },
    })
    fireEvent.change(screen.getByLabelText(/Year of Study/i), {
      target: { value: 2 },
    })
    fireEvent.change(screen.getByLabelText(/Supervisor Name/i), {
      target: { value: 'Dr. Smith' },
    })
    fireEvent.change(screen.getByLabelText(/Expected Completion/i), {
      target: { value: '2025-12-15' },
    })
    fireEvent.change(screen.getByLabelText(/Student Signature/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/Signature Date/i), {
      target: { value: '2024-01-01' },
    })

    fireEvent.click(screen.getByText(/Submit/i))

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Form submitted successfully!')
    })
  })
})
