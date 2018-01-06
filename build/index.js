/*
 * Expected config:
 *
 * {
 *   "platform": "Optoma",
 *   "host": "optoma-projector.local",
 * }
 */
var Accessory, Characteristic, Service, UUIDGen;

const platformName = 'homebridge-plugin-optoma';
const platformPrettyName = 'Optoma';
const fetch = require('node-fetch');

module.exports = homebridge => {
  Accessory = homebridge.platformAccessory;
  Characteristic = homebridge.hap.Characteristic;
  Service = homebridge.hap.Service;
  UUIDGen = homebridge.hap.uuid;

  homebridge.registerAccessory(platformName, platformPrettyName, Projector, true);
};

class Projector {

  // These values are provided via Homebridge
  constructor(log, config) {
    this.createServices = () => {
      const infoService = new Service.AccessoryInformation();
      infoService.setCharacteristic(Characteristic.Manufacturer, 'Yamaha').setCharacteristic(Characteristic.Model, 'TODO Model').setCharacteristic(Characteristic.SerialNumber, 'TODO SN');

      const switchService = new Service.Switch(this.name);
      switchService.getCharacteristic(Characteristic.On).on('get', this.getPower).on('set', this.setPower);

      return [infoService, switchService];
    };

    this.getServices = () => {
      return [this.infoService, this.switchService];
    };

    this.getPower = cb => {
      if (this.lastChecked && this.lastChecked > Date.now() - this.checkInterval) {
        this.log.debug("Using cached power state");
        return cb(null, this.lastState);
      }

      fetch(this.host + '/').then(res => {
        if (!res.ok) {
          throw new Error(res.status + ' ' + res.statusText);
        }
        return res;
      }).then(res => res.text()).then(text => text.match(/OK([01])/)[1]).then(statusText => {
        const powerState = statusText === "1";
        this.lastState = powerState;
        this.lastChecked = Date.now();
        cb(null, powerState);
      });
    };

    this.setPower = (on, cb) => {
      // There's a weird interaction (pair of bugs) where this fetch wrapper
      // lowercases all of the HTTP header keys, and the ESP8266WebServer library
      // won't parse the POST body unless the Content-Length header is formatted
      // exactly as such. Fortunately, throwing the value in the query string
      // allows it to go through just fine.
      state = on ? "on" : "off";
      fetch(this.host + '/power?state=' + state, { method: "POST" }).then(_ => {
        this.lastState = on;
        this.lastChecked = Date.now();
        cb();
      });
    };

    if (!config) {
      log('Ignoring projector - no config');
      return;
    }
    log('Optoma plugin loaded');
    this.log = log;

    const { host } = config;
    this.host = host;

    // State caching variables: when the projector is changing state, it
    // reports the _current_ rather than the _target_ state. This will cache
    // the last known state (either from polling or toggling it) for 15s
    this.lastState = null;
    this.lastChecked = null;
    this.checkInterval = 15000; // milliseconds

    [this.infoService, this.switchService] = this.createServices();
  }

}