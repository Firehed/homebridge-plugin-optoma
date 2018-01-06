# homebridge-plugin-optoma

Homekit connectivity for a network-connected Optoma projector.

Designed to work in combination with [ESP8266-Optoma](https://github.com/Firehed/ESP8266-Optoma), which takes the RS-232 control port and exposes it to the network with an ESP-8266.

## How it works

The above Arduino code creates a tiny HTTP server to read and toggle the projector's power.
See its documentation for further information, including how to wire things up.
This uses that API to create a Switch accessory in Homekit.

## Installation

Assuming you already have Homebridge running somewhere, just install this plugin like you would with any other: `npm i -g homebridge-platform-optoma`.

If you don't have Homebridge set up with at least one other device, it's probably best to not start with this one.
While this plugin should work with very little work or configuration, the hardware side has a decent chance of being quite fiddly and you won't want to deal with that _in addition to_ getting Homebridge up and running.

## Configuration

In your existing Homebridge configration, add an accessory with the following structure:

```json
"platforms": [
    {
        "platform": "Optoma",
        "host": "http://optoma-projector.local"
    }
]
```

Make sure that the `host` field includes the `http` protocol.
Depending on your network setup, you may need to use a different host name, or the IP address directly.

## Contributing

Send a pull request or open an issue.

## License

MIT
