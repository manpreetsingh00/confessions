document.addEventListener("DOMContentLoaded", function () {
    const sortSelect = document.getElementById("sort");
    const tableBody = document.querySelector("#confessions-table tbody");
  
    sortSelect.addEventListener("change", function () {
      const sortBy = this.value;
      const rows = Array.from(tableBody.querySelectorAll("tr"));
  
      rows.sort((rowA, rowB) => {
        const valueA = rowA.querySelector(`td[data-sort="${sortBy}"]`).textContent;
        const valueB = rowB.querySelector(`td[data-sort="${sortBy}"]`).textContent;
        return valueA.localeCompare(valueB);
      });
  
      tableBody.innerHTML = "";
      rows.forEach(row => {
        tableBody.appendChild(row);
      });
    });

   const popupButtons = document.querySelectorAll(".open-popup-button"); // Moved this line inside the DOMContentLoaded event

 popupButtons.forEach(button => {
    button.addEventListener("click", function () {
      const text = this.getAttribute("data-text");
      openConfessionPopup(text);
    });
  });

  function openConfessionPopup(text) {
    const modal = document.getElementById("confessionModal");
    const modalContent = document.getElementById("confessionModalContent");

    modalContent.textContent = text;
    modal.style.display = "block";

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  });

  const socket = io();

  socket.on("newConfession", confession => {
   // Update the table with the new confession
   const tableBody = document.getElementById("confessions-table");
   const newRow = document.createElement("tr");
   newRow.innerHTML = `
      <td> <span class="new">New</span> </td>
     <td>${confession.text}</td>
     <td>${confession.timestamp.toLocaleString()}</td>
   `;
   // Insert the new row before the first row in the table
   tableBody.insertBefore(newRow, tableBody.firstChild);

  });