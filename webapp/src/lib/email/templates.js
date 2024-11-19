export const defaultTemplates = {
  repair: {
    statusUpdate: {
      id: 'repair_status_update',
      name: 'Repair Status Update',
      subject: 'Repair Status Update #{ticketId}',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Repair Status Update</h1>
          <p>Your repair ticket has been updated to: <strong>{{status}}</strong></p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0;">Repair Details:</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Ticket ID:</strong> {{ticketId}}</li>
              <li><strong>Status:</strong> {{status}}</li>
              <li><strong>Equipment:</strong> {{equipmentType}}</li>
              <li><strong>Notes:</strong> {{notes}}</li>
            </ul>
            {{#if isComplete}}
            <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 6px;">
              <p style="margin: 0;"><strong>Your item is ready for pickup!</strong></p>
              <p style="margin-top: 10px;">Please visit our location during business hours to collect your equipment.</p>
            </div>
            {{/if}}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            If you have any questions, please contact us at {{supportEmail}}
          </p>
        </div>
      `
    },
    completion: {
      id: 'repair_completion',
      name: 'Repair Completion',
      subject: 'Your Repair is Complete - Ready for Pickup #{ticketId}',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Repair Complete!</h1>
          <p>Great news! Your equipment repair has been completed and is ready for pickup.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0;">Repair Summary:</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Ticket ID:</strong> {{ticketId}}</li>
              <li><strong>Equipment:</strong> {{equipmentType}}</li>
              <li><strong>Completion Date:</strong> {{completionDate}}</li>
              <li><strong>Notes:</strong> {{notes}}</li>
            </ul>
            <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 6px;">
              <p style="margin: 0;"><strong>Next Steps:</strong></p>
              <p style="margin-top: 10px;">Please visit our location during business hours to collect your equipment.</p>
            </div>
          </div>
        </div>
      `
    }
  },
  rental: {
    confirmation: {
      id: 'rental_confirmation',
      name: 'Rental Confirmation',
      subject: 'Rental Confirmation #{rentalId}',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Rental Confirmation</h1>
          <p>Your rental has been confirmed!</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0;">Rental Details:</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Rental ID:</strong> {{rentalId}}</li>
              <li><strong>Equipment:</strong> {{equipmentName}}</li>
              <li><strong>Start Date:</strong> {{startDate}}</li>
              <li><strong>End Date:</strong> {{endDate}}</li>
              <li><strong>Total Cost:</strong> {{totalCost}}</li>
            </ul>
            <div style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 6px;">
              <p style="margin: 0;"><strong>Pickup Information:</strong></p>
              <p style="margin-top: 10px;">Please bring a valid ID when picking up your equipment.</p>
            </div>
          </div>
        </div>
      `
    }
  }
}; 