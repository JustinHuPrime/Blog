"use strict";

window.addEventListener("load", () => {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById("canvas");
  /**
   * @type {CanvasRenderingContext2D}
   */
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  let interval = undefined;
  let startSimulation = () => {
    if (interval !== undefined) {
      clearInterval(interval);
    }
    let eliera = {
      height: Number.parseFloat(
        document.getElementById("eliera-height").value.replace(/,/g, "")
      ),
      radius: Number.parseFloat(
        document.getElementById("eliera-radius").value.replace(/,/g, "")
      ),
    };
    let satellite = {
      x: Number.parseFloat(
        document.getElementById("satellite-x").value.replace(/,/g, "")
      ),
      y: Number.parseFloat(
        document.getElementById("satellite-y").value.replace(/,/g, "")
      ),
      z: 0,
      dx: Number.parseFloat(
        document.getElementById("satellite-dx").value.replace(/,/g, "")
      ),
      dy: Number.parseFloat(
        document.getElementById("satellite-dy").value.replace(/,/g, "")
      ),
      dz: 0,
    };
    let displayScale = Number.parseFloat(
      document.getElementById("display-scale").value.replace(/,/g, "")
    );
    let stepsPerFrame = Number.parseFloat(
      document.getElementById("steps-per-frame").value.replace(/,/g, "")
    );
    let timePerStep = Number.parseFloat(
      document.getElementById("time-per-step").value.replace(/,/g, "")
    );
    const precursorLerpDistance = Number.parseFloat(
      document
        .getElementById("precursor-gravity-distance")
        .value.replace(/,/g, "")
    );
    const PRECURSOR_G = Number.parseFloat(
      document.getElementById("precursor-gravity").value.replace(/,/g, "")
    );
    const NORMAL_G =
      -6.6743e-11 *
      Number.parseFloat(
        document.getElementById("eliera-mass").value.replace(/,/g, "")
      );

    let frame = 0;
    interval = setInterval(() => {
      // clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw eliera
      ctx.fillStyle = "#0000ff";
      ctx.fillRect(
        512 - eliera.height / displayScale,
        512 - eliera.radius / displayScale,
        (eliera.height * 2) / displayScale,
        (eliera.radius * 2) / displayScale
      );
      // draw eliera com
      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(512, 512, 3, 0, Math.PI * 2);
      ctx.fill();

      // draw satellite
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        512 + satellite.x / displayScale,
        512 + -satellite.y / displayScale,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // write out
      if (frame % 20 === 0) {
        document.getElementById("satellite-x-out").innerText =
          Math.round((satellite.x / 1000) * 1000) / 1000;
        document.getElementById("satellite-y-out").innerText =
          Math.round((satellite.y / 1000) * 1000) / 1000;
        document.getElementById("satellite-dx-out").innerText =
          Math.round((satellite.dx / 1000) * 1000) / 1000;
        document.getElementById("satellite-dy-out").innerText =
          Math.round((satellite.dy / 1000) * 1000) / 1000;
      }

      // do physics steps

      for (let n = 0; n < stepsPerFrame; ++n) {
        // distance to surface
        let distanceToSurface = Math.abs(satellite.x);
        let distanceToCenter = Math.sqrt(
          Math.pow(satellite.x, 2) +
            Math.pow(satellite.y, 2) +
            Math.pow(satellite.z, 2)
        );

        // calculate acceleration

        // if satellite is close to one of the coin faces, acceleration = lerp between Precursor field and regular gravity
        if (
          -eliera.radius <= satellite.y &&
          satellite.y <= eliera.radius &&
          distanceToSurface < precursorLerpDistance
        ) {
          let precursor = {
            x: -Math.sign(satellite.x) * PRECURSOR_G,
            y: 0,
            z: 0,
          };
          let normal_force = NORMAL_G / Math.pow(distanceToCenter, 2);
          let normal = {
            x: (normal_force * satellite.x) / distanceToCenter,
            y: (normal_force * satellite.y) / distanceToCenter,
            z: (normal_force * satellite.z) / distanceToCenter,
          };
          let t = distanceToSurface / precursorLerpDistance;
          let total = {};
          total.x = t * normal.x + (1 - t) * precursor.x;
          total.y = t * normal.y + (1 - t) * precursor.y;
          total.z = t * normal.z + (1 - t) * precursor.z;

          // apply acceleration
          satellite.dx += total.x * timePerStep;
          satellite.dy += total.y * timePerStep;
          satellite.dz += total.z * timePerStep;
        } else {
          // just apply normal acceleration
          let normal_force = NORMAL_G / Math.pow(distanceToCenter, 2);
          let normal = {
            x: (normal_force * satellite.x) / distanceToCenter,
            y: (normal_force * satellite.y) / distanceToCenter,
            z: (normal_force * satellite.z) / distanceToCenter,
          };
          satellite.dx += normal.x * timePerStep;
          satellite.dy += normal.y * timePerStep;
          satellite.dz += normal.z * timePerStep;
        }
        // move satellite
        satellite.x += satellite.dx * timePerStep;
        satellite.y += satellite.dy * timePerStep;
        satellite.z += satellite.dz * timePerStep;
      }

      ++frame;
    }, 1000 / 60);
  };

  document.getElementById("start").addEventListener("click", startSimulation);
  window.addEventListener("keypress", (k) => {
    if (k.key === "r") {
      startSimulation();
    }
  });
  startSimulation();
});
