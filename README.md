# JuTTY

[![License][mit-badge]][mit-url]
[![NPM version](https://badge.fury.io/js/jutty.svg)](http://badge.fury.io/js/jutty)

> Web-based SSH/Telnet client, useful in environments where only http(s) is allowed

> Multiple Terminal Support

![JuTTY Settings](/settings.png?raw=true)

## Install

*  `git clone https://github.com/maltsev25/jutty`
*  `cd jutty`
*  `npm install --only=prod`

## do not forget configure .env

## Run on HTTP:

    node ./dist/app.js

## Run on HTTPS:

Always use HTTPS! If you don't have SSL certificates from a CA you can
create a self signed certificate using this command:

  `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 30000 -nodes`

And then run:

    node ./dist/app.js

## Run jutty behind nginx:

Put the following configuration in nginx's conf:

    location /jutty {
	    proxy_pass http://127.0.0.1:3000;
	    proxy_http_version 1.1;
	    proxy_set_header Upgrade $http_upgrade;
	    proxy_set_header Connection "upgrade";
	    proxy_read_timeout 43200000;

	    proxy_set_header X-Real-IP $remote_addr;
	    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	    proxy_set_header Host $http_host;
	    proxy_set_header X-NginX-Proxy true;
    }

**Note that if your Nginx is configured for HTTPS you should run jutty without SSL.**

## Run jutty as a service daemon

place `bin/jutty.service` in `/etc/systemd/system`

```bash
    systemctl enable jutty.service
    systemctl start jutty.service
```

## Credits

Forked from [jutty](https://github.com/hobbyquaker/jutty)    

#### Software used in JuTTY

* [hterm](https://chromium.googlesource.com/apps/libapps/+/master/hterm/)
* [node-pty](https://github.com/microsoft/node-pty/)
* [socket.io](http://socket.io/)
* [jquery](https://jquery.com/)
* [bootstrap](http://getbootstrap.com/)
* [bootswatch darkly theme](https://bootswatch.com/darkly/)
* [bootstrap file input](http://plugins.krajee.com/file-input)
* [store.js](https://github.com/marcuswestin/store.js/)
* [yalm](https://github.com/hobbyquaker/yalm)
* [optimist](https://github.com/substack/node-optimist)

## License

MIT

Copyright (c) 2020 [Gleb](https://github.com/maltsev25)

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE