document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Simple in-memory activity data (replace with real fetch if available)
  const activities = [
    { id: 'chess', title: 'Chess Club', desc: 'Strategy and friendly matches', capacity: 20, participants: ['alice@mergington.edu', 'bob@mergington.edu'] },
    { id: 'drama', title: 'Drama Club', desc: 'Acting workshops and plays', capacity: 30, participants: [] },
    { id: 'robotics', title: 'Robotics Team', desc: 'Build and program robots', capacity: 15, participants: ['carol@mergington.edu'] }
  ];

  const template = document.getElementById('activity-card-template');

  function renderActivities() {
    activitiesList.innerHTML = '';
    activities.forEach(act => {
      const node = template.content.cloneNode(true);
      node.querySelector('.activity-title').textContent = act.title;
      node.querySelector('.activity-desc').textContent = act.desc;
      node.querySelector('.activity-capacity').textContent = `${act.participants.length}/${act.capacity}`;
      const participantsUl = node.querySelector('.participants');
      const noParts = node.querySelector('.no-participants');

      if (act.participants.length === 0) {
        noParts.classList.remove('hidden');
        participantsUl.innerHTML = '';
      } else {
        noParts.classList.add('hidden');
        participantsUl.innerHTML = '';
        act.participants.forEach(p => {
          const li = document.createElement('li');
          li.className = 'participant-item';
          // simple avatar using initials
          const avatar = document.createElement('span');
          avatar.className = 'participant-avatar';
          const initials = p.split('@')[0].split(/[.\-_]/).map(s => s[0]?.toUpperCase()).join('').slice(0,2);
          avatar.textContent = initials || 'U';
          const text = document.createElement('span');
          text.className = 'participant-email';
          text.textContent = p;
          li.appendChild(avatar);
          li.appendChild(text);
          participantsUl.appendChild(li);
        });
      }

      activitiesList.appendChild(node);
    });
  }

  function populateSelect() {
    // keep the first placeholder option
    activitySelect.querySelectorAll('option:not([value=""])').forEach(o => o.remove());
    activities.forEach(act => {
      const opt = document.createElement('option');
      opt.value = act.id;
      opt.textContent = act.title;
      activitySelect.appendChild(opt);
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // init
  populateSelect();
  renderActivities();
});
