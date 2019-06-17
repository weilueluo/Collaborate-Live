const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');
const adminItems = document.querySelectorAll('.admin');

// Check if user is logged in, and show corresponding navbar items.
const setupUI = (user) => {
  // If user is logged in.
  if (user) {
    if (user.admin) {
      adminItems.forEach(item => item.style.display = 'block');
    }
    // Account info
    // db.collection('users').doc(user.uid).get().then(doc => {
    //   const html = `
    //     <div>Logged in as: <strong>${user.email}</strong></div>
    //     <div><i>${doc.data().bio}</i></div>
    //     <div class="pink-text">${user.admin ? 'Admin' : ''}</div>
    //   `;
    //   accountDetails.innerHTML = html;
    // })
    // toggle UI elements
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
  } else {
    adminItems.forEach(item => item.style.display = 'none');
    // Hide account information
    // accountDetails.innerHTML = '<div>You think you are so smart, huh?</div>';
    // toggle UI elements
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
}





// Setup materialize components

// We are waiting for the DOMContentLoaded event. When it's loaded onto the page, we're going to run a callback function.
document.addEventListener('DOMContentLoaded', function() {

  // Grabbing all of the elements with the class name modal.
  var modals = document.querySelectorAll('.modal');
  // We're initializing all these modals that were put into the modals variable above.
  M.Modal.init(modals);

  // Doing the same thing to collapsible class modules.
  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);

});





// // Grabbing all the elements with the .tasks class name.
// const taskList = document.querySelector('.tasks');
//
// // Setup tasks
//
// const setupTasks = (data) => {
//
//   // If we have data aka if we're logged in, show the tasks.
//   if (data.length) {
//     // Set up a blank string.
//     let html = '';
//
//     // Cycle through that data one by one. We're getting the data from each of the doc items and store it in the tasks constant.
//     data.forEach(doc => {
//       const tasks = doc.data();
//
//       // Dynamically output data
//       const li = `
//         <li>
//           <div class="collapsible-header grey lighten-4">${tasks.title}</div>
//           <div class="collapsible-body white">${tasks.description}</div>
//         </li>
//       `;
//
//       // Append the li to the HTML.
//       html += li
//     });
//
//     taskList.innerHTML = html;
//     // Otherwise, show the given text.
//   } else {
//     taskList.innerHTML = '<h5 class="center-align">Login to view your tasks</h5>'
//   }
// }
