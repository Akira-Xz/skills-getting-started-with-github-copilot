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
            // delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'participant-delete';
            delBtn.type = 'button';
            delBtn.title = 'Unregister participant';
            delBtn.setAttribute('aria-label', `Unregister ${p}`);
            delBtn.innerHTML = '✖';
            delBtn.addEventListener('click', async () => {
              // optimistic UI: remove from local array and re-render on success
              try {
                const resp = await fetch(`/activities/${encodeURIComponent(act.title)}/unregister?email=${encodeURIComponent(p)}`, { method: 'POST' });
                const body = await resp.json();
                if (!resp.ok) {
                  console.error('Failed to unregister:', body);
                  alert(body.detail || 'Failed to unregister participant');
                  return;
                }
                // remove from local data and re-render
                const idx = act.participants.indexOf(p);
                if (idx !== -1) act.participants.splice(idx, 1);
                renderActivities();
              } catch (err) {
                console.error('Error unregistering participant', err);
                alert('Error unregistering participant');
              }
            });
          li.appendChild(avatar);
          li.appendChild(text);
            li.appendChild(delBtn);
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
        // Update local activities data so the UI shows the new participant immediately
        const actObj = activities.find(a => a.id === activity);
        if (actObj) {
          if (!actObj.participants.includes(email)) {
            actObj.participants.push(email);
          }
          renderActivities();
        }
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
