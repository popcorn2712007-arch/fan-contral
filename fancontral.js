
/*
  ตั้งค่า IP ของ ESP32 ที่นี่
  ตัวอย่าง: http://192.168.1.100

  ถ้าเปิดหน้าเว็บจาก ESP32 โดยตรง
  ให้ใช้ ESP32_URL = ""
*/

const ESP32_URL = "http://192.168.1.100";

const onButton = document.getElementById("onButton");
const offButton = document.getElementById("offButton");

const fanStatus = document.getElementById("fanStatus");
const fanCircle = document.getElementById("fanCircle");

const connectionDot =
  document.getElementById("connectionDot");

const connectionText =
  document.getElementById("connectionText");

const deviceConnection =
  document.getElementById("deviceConnection");

const message =
  document.getElementById("message");

let busy = false;

async function request(path) {
  const response = await fetch(
    ESP32_URL + path,
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error("HTTP Error");
  }

  return response;
}

function setConnection(connected) {
  connectionDot.style.background =
    connected ? "#16a34a" : "#ef4444";

  connectionText.innerText =
    connected ? "Connected" : "Disconnected";

  deviceConnection.innerText =
    connected ? "Online" : "Offline";
}

function showFanState(state) {
  fanStatus.innerText =
    state ? "พัดลมกำลังทำงาน" : "พัดลมปิดอยู่";

  fanCircle.classList.toggle("active", state);
}

async function updateStatus() {
  try {
    const response = await request("/status");
    const data = await response.json();

    setConnection(true);
    showFanState(data.state);

  } catch (error) {
    setConnection(false);
    fanStatus.innerText = "ไม่สามารถเชื่อมต่อ ESP32";
  }
}

async function controlFan(action) {
  if (busy) return;

  busy = true;
  onButton.disabled = true;
  offButton.disabled = true;

  message.innerText = "กำลังส่งคำสั่ง...";

  try {
    await request("/" + action);

    await updateStatus();

    message.innerText =
      action === "on"
        ? "ส่งคำสั่งเปิดพัดลมสำเร็จ"
        : "ส่งคำสั่งปิดพัดลมสำเร็จ";

  } catch (error) {
    message.innerText =
      "ส่งคำสั่งไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ";

    setConnection(false);
  }

  busy = false;
  onButton.disabled = false;
  offButton.disabled = false;
}

onButton.addEventListener("click", () => {
  controlFan("on");
});

offButton.addEventListener("click", () => {
  controlFan("off");
});

// ตรวจสอบสถานะทุก 2 วินาที
updateStatus();
setInterval(updateStatus, 2000);
