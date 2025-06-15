document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get("id"); // Get ID from URL

    if (!serviceId) {
        console.error("Service ID is missing in URL");
        return;
    }

    fetch(`/api/services/${serviceId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch service data");
            }
            return response.json();
        })
        .then(service => {
            const jobDetailsContainer = document.getElementById("profile_details");

            jobDetailsContainer.innerHTML = `
                <div class="details d-flex flex-column flex-sm-row">
                    <div class="pic rounded-4 me-sm-4 mb-3 mb-sm-0">
                        <img class="w-100 h-100 object-fit-cover" src="${service.image}" alt="${service.name}">
                    </div>
                    <div>
                        <p class="name fs-3 fw-bolder">${service.name}</p>
                        <p class="skill mt-0 fs-5 fw-medium">${service.skill}</p>
                        <p class="experience">Experience: ${service.experience}</p>
                        <p class="location">Location Serving: ${service.location}</p>
                        <p class="available">Available: ${service.availability}</p>
                        <p class="price">Price: ₹${service.price}</p>
                        <p class="mobile">Contact: ${service.mobile}</p>
                    </div>
                </div>

                <div class="bio mt-sm-4">
                    <h2>About Service Provider</h2>
                    <p>${service.bio}</p>
                </div>

                <div class="past-work mt-sm-5">
                    <h2 class="text-center">Recent Projects</h2>
                    <div class="gallery mt-sm-4 row">
                        <div class="col mx-sm-2 img">
                            <img src="${service.image}" alt="Project Image" class="w-100 h-100 object-fit-cover rounded">
                        </div>
                        <!-- You can add more dummy or real images here -->
                    </div>
                </div>

                <div class="review pt-sm-5">
                    <h2 class="text-center">What Do Customers Say</h2>
                    <p class="text-center">No reviews available yet.</p>
                </div>
            `;
        })
        .catch(error => {
            console.error("Error loading profile:", error);
            const jobDetailsContainer = document.getElementById("profile_details");
            jobDetailsContainer.innerHTML = `<p class="text-danger">Failed to load profile. Please try again later.</p>`;
        });
});
