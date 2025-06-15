document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('root');
    const searchInput = document.getElementById('searchInput');
    const filterLocation = document.getElementById('filterLocation');
    const filterSkill = document.getElementById('filterSkill');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const sortSelect = document.getElementById('sortSelect');
  
    let allServices = [];
  
    // Render services
    const renderServices = (services) => {
      root.innerHTML = '';
  
      if (services.length === 0) {
        root.innerHTML = '<p class="text-muted">No matching services found.</p>';
        return;
      }
  
      services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'card shadow-sm mb-3';
        card.innerHTML = `
          <div class="row g-0">
            <div class="col-md-4">
              <img src="${service.image}" class="img-fluid rounded-start" alt="${service.name}" />
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">${service.name}</h5>
                <p class="card-text mb-1"><strong>Skill:</strong> ${service.skill}</p>
                <p class="card-text mb-1"><strong>Location:</strong> ${service.location}</p>
                <p class="card-text mb-1"><strong>Price:</strong> ₹${service.price}</p>
                <p class="card-text mb-1"><strong>Experience:</strong> ${service.experience}</p>
                <a href="profile.html?id=${service.id}" class="btn btn-primary btn-sm mt-2">View Profile</a>
              </div>
            </div>
          </div>
        `;
        root.appendChild(card);
      });
    };
  
    // Fetch and render services
    const fetchServices = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSkill = urlParams.get('skill')?.toLowerCase();
  
      fetch('http://localhost:3000/api/services')
        .then(res => res.json())
        .then(data => {
          allServices = data;
          if (initialSkill) {
            const filtered = allServices.filter(s =>
              s.skill.toLowerCase().includes(initialSkill)
            );
            renderServices(filtered);
          } else {
            renderServices(data);
          }
        })
        .catch(err => {
          console.error('Error fetching services:', err);
          root.innerHTML = '<p class="text-danger">Failed to load services.</p>';
        });
    };
  
    // Filter and sort logic
    const applyFilters = () => {
      let filtered = [...allServices];
  
      const keyword = searchInput.value.toLowerCase();
      const location = filterLocation.value.toLowerCase();
      const skill = filterSkill.value.toLowerCase();
      const maxPrice = parseInt(priceRange.value);
      const sortBy = sortSelect.value;
  
      if (keyword) {
        filtered = filtered.filter(s =>
          s.name.toLowerCase().includes(keyword) ||
          s.location.toLowerCase().includes(keyword) ||
          s.skill.toLowerCase().includes(keyword)
        );
      }
  
      if (location) {
        filtered = filtered.filter(s => s.location.toLowerCase().includes(location));
      }
  
      if (skill) {
        filtered = filtered.filter(s => s.skill.toLowerCase().includes(skill));
      }
  
      if (maxPrice) {
        filtered = filtered.filter(s => parseInt(s.price) <= maxPrice);
      }
  
      switch (sortBy) {
        case 'priceAsc':
          filtered.sort((a, b) => parseInt(a.price) - parseInt(b.price));
          break;
        case 'priceDesc':
          filtered.sort((a, b) => parseInt(b.price) - parseInt(a.price));
          break;
        case 'nameAsc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'expDesc':
          filtered.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
          break;
      }
  
      renderServices(filtered);
    };
  
    // Event listeners
    applyFiltersBtn.addEventListener('click', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    priceRange.addEventListener('input', () => {
      priceValue.textContent = priceRange.value;
    });
  
    // Initial fetch
    fetchServices();
  });
  