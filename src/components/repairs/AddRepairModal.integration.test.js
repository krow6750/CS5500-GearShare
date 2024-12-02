import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddRepairModal from '../repairs/AddRepairModal';
import { airtableService } from '@/lib/airtable/airtableService';

describe('AddRepairModal Integration Tests', () => {
  const onClose = () => {};
  const onSuccess = () => {};

  // Clean up test records after each test
  afterEach(async () => {
    const testRecords = await airtableService.fetchAllRepairTickets();
    const testEntries = testRecords.filter(record => 
      record.fields['First Name']?.startsWith('Integration') || 
      record.fields['First Name']?.startsWith('File')
    );
    
    for (const record of testEntries) {
      await airtableService.deleteRepairTicket(record.id);
    }
  });

  it('should complete full repair ticket creation flow', async () => {
    render(
      <AddRepairModal 
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // 1. Verify Repair ID is auto-generated
    await waitFor(() => {
      const repairIdInput = screen.getByLabelText('Repair ID');
      expect(repairIdInput.value).toMatch(/^REP\d{13}\d{3}$/);
    });

    // 2. Fill out the complete form
    await userEvent.type(screen.getByLabelText('First Name'), 'Integration');
    await userEvent.type(screen.getByLabelText('Last Name'), 'Test');
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Telephone'), '555-0123');
    await userEvent.selectOptions(screen.getByLabelText('Item Type'), 'Jacket');
    await userEvent.type(screen.getByLabelText('Brand'), 'Test Brand');
    await userEvent.type(screen.getByLabelText('Color'), 'Blue');
    await userEvent.type(screen.getByLabelText('Weight (Ounces)'), '16');
    await userEvent.type(screen.getByLabelText('Damage or Defect'), 'Test damage description');
    await userEvent.type(screen.getByLabelText('Internal Notes'), 'Test internal notes');
    await userEvent.selectOptions(screen.getByLabelText('Delivery of Item'), 'I\'ll mail it');
    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Dropped Off, Awaiting Repair');
    await userEvent.type(screen.getByLabelText('Price Quote ($)'), '50');
    await userEvent.type(screen.getByLabelText('Final Price ($)'), '45');
    await userEvent.type(screen.getByLabelText('Amount Paid ($)'), '45');
    await userEvent.selectOptions(screen.getByLabelText('Payment Type'), 'cash');
    await userEvent.type(screen.getByLabelText('Referred By'), 'Test Referral');
    await userEvent.selectOptions(screen.getByLabelText('Requestor Type'), 'Paying Customer');

    // 3. Submit the form
    const submitButton = screen.getByText('Create Ticket');
    await userEvent.click(submitButton);

    // 4. Verify the submission was successful
    await waitFor(
      () => {
        // The modal should close on success
        expect(screen.queryByText('Create Repair Ticket')).not.toBeInTheDocument();
      },
      { timeout: 5000 } // Increased timeout for API calls
    );
  });

  it('should handle file uploads and submission', async () => {
    render(
      <AddRepairModal 
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Fill required fields
    await userEvent.type(screen.getByLabelText('First Name'), 'File');
    await userEvent.type(screen.getByLabelText('Last Name'), 'Test');

    // Create and upload a test file
    const file = new File(['test image content'], 'test-image.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Photo/Attachment');
    await userEvent.upload(fileInput, file);

    // Verify file was uploaded
    expect(fileInput.files[0]).toBeTruthy();
    expect(fileInput.files[0].name).toBe('test-image.png');

    // Submit form with file
    const submitButton = screen.getByText('Create Ticket');
    await userEvent.click(submitButton);

    // Verify submission success
    await waitFor(
      () => {
        expect(screen.queryByText('Create Repair Ticket')).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('should validate required fields', async () => {
    render(
      <AddRepairModal 
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Try to submit without required fields
    const submitButton = screen.getByText('Create Ticket');
    await userEvent.click(submitButton);

    // Verify form validation
    await waitFor(() => {
      // HTML5 validation messages should appear
      expect(screen.getByLabelText('First Name')).toBeInvalid();
      expect(screen.getByLabelText('Last Name')).toBeInvalid();
    });
  });

  it('should handle numerical inputs correctly', async () => {
    render(
      <AddRepairModal 
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Test price inputs
    const priceQuoteInput = screen.getByLabelText('Price Quote ($)');
    await userEvent.type(priceQuoteInput, '99.99');
    expect(priceQuoteInput.value).toBe('99.99');

    // Test weight input with decimal
    const weightInput = screen.getByLabelText('Weight (Ounces)');
    await userEvent.type(weightInput, '16.5');
    expect(weightInput.value).toBe('16.5');
  });

  it('should generate unique Repair IDs for multiple instances', async () => {
    // Create two instances of the modal
    const { rerender } = render(
      <AddRepairModal 
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Get first Repair ID
    const firstRepairId = await waitFor(() => {
      const repairIdInput = screen.getByLabelText('Repair ID');
      return repairIdInput.value;
    });

    // Rerender the component
    rerender(
      <AddRepairModal 
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Get second Repair ID
    const secondRepairId = await waitFor(() => {
      const repairIdInput = screen.getByLabelText('Repair ID');
      return repairIdInput.value;
    });

    // Verify IDs are different
    expect(firstRepairId).not.toBe(secondRepairId);
    expect(firstRepairId).toMatch(/^REP\d{13}\d{3}$/);
    expect(secondRepairId).toMatch(/^REP\d{13}\d{3}$/);
  });
});