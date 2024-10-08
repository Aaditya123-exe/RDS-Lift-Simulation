document.querySelector(".header button").addEventListener("click", () => {
  const floors = parseInt(document.getElementById("floorsInput").value);
  const lifts = parseInt(document.getElementById("liftsInput").value);
  if (!floors || !lifts || floors <= 0 || lifts <= 0) {
    alert("Please enter a valid number");
    const buildingContainer = document.getElementById("buildingContainer");
    buildingContainer.innerHTML = "";
    return;
  }
  generateBuilding(floors, lifts);
  document.getElementById("buildingContainer").style.display = "flex";
});

// Data Store
let liftState = [];
let pendingRequests = [];

// Function to generate the building structure
function generateBuilding(floors, liftCount) {
  const buildingContainer = document.getElementById("buildingContainer");
  buildingContainer.innerHTML = "";
  liftState = [];
  pendingRequests = [];

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
    if (i === floors - 1) upButton.style.display = "none";

    const downButton = document.createElement("button");
    downButton.innerText = "Down";
    downButton.onclick = () => handleLiftRequest(i, "down");
    if (i === 0) downButton.style.display = "none";
    floorButtons.appendChild(upButton);
    floorButtons.appendChild(downButton);

    floorInfo.appendChild(floorNumber);
    floorInfo.appendChild(floorButtons);

    let liftsContainer;
    if (i === 0) {
      liftsContainer = document.createElement("div");
      liftsContainer.className = "lifts-container";
      if (floors == 1) {
        liftCount = 1;
      }

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

// Function to find the nearest available stopped lift
function findAvailableLift(targetFloor) {
  let nearestLift = null;
  let minDistance = Infinity;

  // Iterate through the lifts to find the nearest stopped lift
  for (const lift of liftState) {
    // Check only stopped lifts
    if (lift.state === "stopped") {
      const distance = Math.abs(lift.currentFloor - targetFloor);
      // Update nearest lift if this one is closer
      if (distance < minDistance) {
        minDistance = distance;
        nearestLift = lift;
      }
    }
  }

  return nearestLift;
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

  const floorHeight = 100;
  const targetPosition = targetFloor * floorHeight;
  const floorDifference = Math.abs(targetFloor - lift.currentFloor);
  const travelTime = 3000 * floorDifference;

  liftElement.style.transitionDuration = `${3 * floorDifference}s`;
  liftElement.style.transform = `translateY(-${targetPosition}px)`;

  setTimeout(() => {
    lift.currentFloor = targetFloor;
    lift.state = "stopped";
    if (callback) callback();
  }, travelTime);
}

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
    }, 1000);
  }, 2000);
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
