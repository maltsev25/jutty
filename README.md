# JuTTY

> Web-based ssh/telnet, useful in environments where only http(s) is allowed.

Forked from [wetty](https://github.com/krishnasrinivas/wetty)

Uses ChromeOS' terminal emulator (hterm) which is a full fledged implementation of
terminal emulation written entirely in Javascript.

hterm source - https://chromium.googlesource.com/apps/libapps/+/master/hterm/

![JuTTY](/terminal.png?raw=true)

Install
-------

*  `git clone https://github.com/hobbyquaker/jutty`

*  `cd jutty`

*  `npm install`

Run on HTTP:
-----------

    node app.js -p 3000


You can also specify the SSH user name in the address bar like this:

  `http://yourserver:3000/jutty/ssh/<username>`

Run on HTTPS:
------------

Always use HTTPS! If you don't have SSL certificates from a CA you can
create a self signed certificate using this command:

  `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 30000 -nodes`

And then run:

    node app.js --sslkey key.pem --sslcert cert.pem -p 3000


Run jutty behind nginx:
----------------------

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

Dockerized Version
------------------

This repo includes a Dockerfile you can use to run a Dockerized version of jutty.  You can run
whatever you want!

Just do:

```
    docker run --name term -p 3000 -dt hobbyquaker/jutty
```



Visit the appropriate URL in your browser (`[localhost|$(boot2docker ip)]:PORT`).  


Run jutty as a service daemon
-----------------------------

Install jutty globally with -g option:

```bash
    $ sudo npm install jutty -g
    $ sudo cp /usr/local/lib/node_modules/jutty/bin/jutty.conf /etc/init
    $ sudo start jutty
```

This will start jutty on port 3000. If you want to change the port or redirect stdout/stderr you should change the last line in `jutty.conf` file, something like this:

    exec sudo -u root jutty -p 80 >> /var/log/jutty.log 2>&1
