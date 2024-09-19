// Event listener for the generate button
document.querySelector(".header button").addEventListener("click", () => {
  const floors = parseInt(document.getElementById("floorsInput").value);
  const lifts = parseInt(document.getElementById("liftsInput").value);
  generateBuilding(floors, lifts);
  document.getElementById("buildingContainer").style.display = "flex"; // Show the building after generation
});

// Data Store
let liftState = [];
let pendingRequests = [];

// Function to generate the building structure
function generateBuilding(floors, liftCount) {
  const buildingContainer = document.getElementById("buildingContainer");
  buildingContainer.innerHTML = ""; // Clear existing content
  liftState = [];
  pendingRequests = [];

  const floorHeight = 80; // Fixed height of 80px for all floors

  // Create floors in correct order (from bottom to top)
  for (let i = 0; i < floors; i++) {
    const floorDiv = document.createElement("div");
    floorDiv.className = "floor";
    floorDiv.id = `floor-${i}`;

    const floorInfo = document.createElement("div");
    floorInfo.className = "floor-info";

    const floorNumber = document.createElement("div");
    floorNumber.className = "floor-number";
    floorNumber.innerText = i === 0 ? "Ground Floor" : `Floor ${i}`;

    const floorButtons = document.createElement("div");
    floorButtons.className = "floor-buttons";

    const upButton = document.createElement("button");
    upButton.innerText = "Up";
    upButton.onclick = () => handleLiftRequest(i, "up");
    if (i === floors - 1) upButton.style.display = "none"; // Hide Up button on top floor

    const downButton = document.createElement("button");
    downButton.innerText = "Down";
    downButton.onclick = () => handleLiftRequest(i, "down");
    if (i === 0) downButton.style.display = "none"; // Hide Down button on ground floor

    floorButtons.appendChild(upButton);
    floorButtons.appendChild(downButton);

    floorInfo.appendChild(floorNumber);
    floorInfo.appendChild(floorButtons);

    let liftsContainer;
    if (i === 0) {
      liftsContainer = document.createElement("div");
      liftsContainer.className = "lifts-container";

      for (let j = 0; j < liftCount; j++) {
        const lift = document.createElement("div");
        lift.className = "lift";
        lift.id = `lift-${j}`;
        liftState.push({
          id: j,
          currentFloor: 0,
          state: "stopped",
          element: lift,
        });
        liftsContainer.appendChild(lift);
      }
    }

    floorDiv.appendChild(floorInfo);
    if (liftsContainer) {
      floorDiv.appendChild(liftsContainer);
    }

    buildingContainer.appendChild(floorDiv);
  }
}

// Function to handle lift requests
function handleLiftRequest(floor, direction) {
  disableFloorButton(floor, direction, true);
  pendingRequests.push({ floor, direction });
  processRequests();
}

// Function to find an available lift
function findAvailableLift(targetFloor) {
  // First, look for a lift on the same floor that is stopped
  const liftOnSameFloor = liftState.find(
    (lift) => lift.currentFloor === targetFloor && lift.state === "stopped"
  );
  if (liftOnSameFloor) return liftOnSameFloor;

  // If no lift on the same floor, find any stopped lift
  const stoppedLift = liftState.find((lift) => lift.state === "stopped");
  return stoppedLift;
}

// Function to process lift requests
function processRequests() {
  if (pendingRequests.length === 0) return;
  const request = pendingRequests.shift();
  const availableLift = findAvailableLift(request.floor);

  if (availableLift) {
    if (availableLift.currentFloor === request.floor) {
      operateLift(availableLift, request.floor, () => {
        enableFloorButton(request.floor, request.direction);
        processRequests();
      });
    } else {
      moveLift(availableLift, request.floor, () => {
        operateLift(availableLift, request.floor, () => {
          enableFloorButton(request.floor, request.direction);
          processRequests();
        });
      });
    }
  } else {
    pendingRequests.unshift(request);
  }
}

// Function to move the lift to the requested floor
function moveLift(lift, targetFloor, callback) {
  lift.state = "moving";
  const liftElement = lift.element;

  // Fixed height of 80px per floor
  const floorHeight = 100;
  const targetPosition = targetFloor * floorHeight;

  // Move lift vertically to the target floor
  liftElement.style.transform = `translateY(-${targetPosition}px)`;

  // Simulate lift movement time (2 seconds per floor)
  setTimeout(() => {
    lift.currentFloor = targetFloor;
    lift.state = "stopped";
    if (callback) callback();
  }, 2000 * Math.abs(targetFloor - lift.currentFloor));
}

// Function to operate lift doors (open and close)
// function operateLift(lift, floor, callback) {
//   lift.state = "opening";
//   const liftElement = lift.element;
//   liftElement.classList.add("open");

//   setTimeout(() => {
//     lift.state = "closing";
//     liftElement.classList.remove("open");

//     setTimeout(() => {
//       lift.state = "stopped";
//       if (callback) callback();
//     }, 2500);
//   }, 2500);
// }

function operateLift(lift, floor, callback) {
  lift.state = "opening";
  lift.element.classList.add("opening");

  setTimeout(() => {
    lift.element.classList.remove("opening");
    lift.element.classList.add("closing");
    lift.state = "closing";

    setTimeout(() => {
      lift.element.classList.remove("closing");
      lift.state = "stopped";
      if (callback) callback();
    }, 1000); // Match the animation duration
  }, 2000); // Time before closing starts
}

// Function to disable specific button on a floor
function disableFloorButton(floor, direction, disable) {
  const buttonSelector =
    direction === "up" ? "button:nth-child(1)" : "button:nth-child(2)";
  const button = document
    .getElementById(`floor-${floor}`)
    .querySelector(buttonSelector);
  if (button) {
    button.disabled = disable;
  }
}

// Function to enable specific button on a floor after operation
function enableFloorButton(floor, direction) {
  const buttonSelector =
    direction === "up" ? "button:nth-child(1)" : "button:nth-child(2)";
  const button = document
    .getElementById(`floor-${floor}`)
    .querySelector(buttonSelector);
  if (button) {
    button.disabled = false;
  }
}
