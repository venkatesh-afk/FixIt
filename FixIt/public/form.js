document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('providerForm');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const providerId = localStorage.getItem('providerId');
      if (!providerId) {
        alert('You must be logged in as a service provider to add a service.');
        return;
      }
  
      const formData = new FormData(form);
      formData.append('providerId', providerId);
  
      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          body: formData
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert('✅ Service added successfully!');
          form.reset();
          window.location.href = 'dashboard.html'; // or wherever you want to redirect
        } else {
          alert('❌ Failed to add service: ' + (result.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error submitting service:', error);
        alert('❌ An unexpected error occurred.');
      }
    });
  });
  