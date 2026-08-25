// Telemetry animation
document.addEventListener("DOMContentLoaded", () => {
  const thermalVal = document.getElementById("thermal-val");
  const rpmVal = document.getElementById("rpm-val");
  const voltVal = document.getElementById("volt-val");

  if (!thermalVal || !rpmVal || !voltVal) return;

  setInterval(() => {
    // Fluctuate thermal between 52 and 58
    const temp = 54 + (Math.random() * 4 - 2);
    thermalVal.innerText = `${temp.toFixed(0)}°C`;

    // Fluctuate RPM between 2350 and 2450
    const rpm = 2400 + (Math.random() * 100 - 50);
    rpmVal.innerText = `${Math.floor(rpm).toLocaleString()}`;

    // Fluctuate Volts between 1.30 and 1.35
    const volt = 1.32 + (Math.random() * 0.04 - 0.02);
    voltVal.innerText = `${volt.toFixed(2)}V`;
  }, 2000);
});
