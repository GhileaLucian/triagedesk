import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketForm } from '../components/TicketForm';

describe('TicketForm Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <TicketForm
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('validates minimum character lengths for subject and message body', async () => {
    const handleSubmit = vi.fn();
    render(
      <TicketForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Classify & Submit/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Title must be at least 3 characters long/i)).toBeInTheDocument();
      expect(screen.getByText(/Body description must be at least 10 characters long/i)).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits successfully when fields satisfy Zod-aligned bounds', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <TicketForm
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    );

    const titleInput = screen.getByLabelText(/Subject Title/i);
    const bodyInput = screen.getByLabelText(/Message Body/i);
    const submitBtn = screen.getByRole('button', { name: /Classify & Submit/i });

    fireEvent.change(titleInput, { target: { value: 'Valid Subscription Issue' } });
    fireEvent.change(bodyInput, { target: { value: 'This is a detailed description of the billing problem.' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Valid Subscription Issue',
        body: 'This is a detailed description of the billing problem.',
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
