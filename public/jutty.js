$(document).ready(function () {


    let term;
    hterm.defaultStorage = new lib.Storage.Local();

    let socket = io(location.origin, {path: '/socket.io'});
    let buf = '';

    let $settings =     $('#settings');
    let $terminal =     $('#terminal');
    let $start =        $('#start');
    let $host =         $('#host');
    let $user =         $('#user');
    let $type =         $('#type');
    let $port =         $('#port');
    let $key =          $('#key');
    let $keyfile =      $("#keyfile");
    let $keyfilename =  $('#keyfilename');
    let $back =         $('#back');
    let $backbutton =   $('#backbutton');
    let $name =         $('#name');
    let $save =         $('#save');
    let $connections =  $('#connections');

    let $ssh =          $('#ssh');
    let $telnet =       $('#telnet');
    let $sshOptions =   $('.ssh');

    let savedConnections = store.get('connections') || {};
    listConnections();


    function Jutty(argv) {
        this.argv_ = argv;
        this.io = null;
        this.pid_ = -1;
    }

    Jutty.prototype.run = function () {
        this.io = this.argv_.io.push();

        this.io.onVTKeystroke = this.sendString_.bind(this);
        this.io.sendString = this.sendString_.bind(this);
        this.io.onTerminalResize = this.onTerminalResize.bind(this);
    };

    Jutty.prototype.sendString_ = function (str) {
        socket.emit('input', str);
    };

    Jutty.prototype.onTerminalResize = function (col, row) {
        socket.emit('resize', {col: col, row: row});
    };

    function htermInit(cb) {
        console.log('htermInit');
        lib.init(function () {
            term = new hterm.Terminal();
            window.term = term;
            term.decorate(document.getElementById('terminal'));

            term.setCursorPosition(0, 0);
            term.setCursorVisible(true);

            term.prefs_.set('ctrl-c-copy', true);
            term.prefs_.set('ctrl-v-paste', true);
            term.prefs_.set('use-default-window-copy', true);

            term.runCommandClass(Jutty, document.location.hash.substr(1));

            //socket.emit('start', {});

            /*
             socket.emit('resize', {
             col: term.screenSize.width,
             row: term.screenSize.height
             });
             */

            if (buf && buf != '') {
                term.io.writeUTF16(buf);
                buf = '';
            }
            cb();
        });
    }

    socket.on('connect', function () {
        $('#disconnect').hide();
    });

    socket.on('output', function (data) {
        if (!term) {
            buf += data;
            return;
        }
        term.io.writeUTF16(data);
    });

    socket.on('end', function () {
        console.log('process end');
        $back.show();
        $backbutton.focus();

    });

    socket.on('disconnect', function () {
        $('#disconnect').show();
    });

    $backbutton.click(function () {
        term.reset();
        $back.hide();
        $settings.show();
        $terminal.hide();
    });

    function getVals() {
        return {
            host:           $.trim($host.val()),
            user:           $.trim($user.val()),
            type:           $ssh.is(':checked') ? 'ssh' : 'telnet',
            port:           $.trim($port.val()),
            key:            $.trim($key.val()),
            keyfilename:    $.trim($keyfilename.val()),
            name:           $.trim($name.val())
        }
    }

    function setVals(obj) {
        console.log(obj);
        $host.val(obj.host || '');
        $user.val(obj.user || '');
        $type.val(obj.type || 'ssh');
        $port.val(obj.port || obj.type === 'telnet' ? '23' : '22');
        $key.val(obj.key || '');
        $keyfilename.val(obj.keyfilename || '');

        if (obj.keyfilename) {
            $keyfile.fileinput('addToStack', new File([obj.key], obj.keyfilename));
            $keyfile.fileinput('refresh');
        } else {
            $keyfile.fileinput('reset');
        }

        $name.val('');
        checkButtons();
    }

    function listConnections() {
        let names = Object.keys(savedConnections).sort();
        $connections.html('');
        names.forEach(function (name) {
            $connections.append('<a class="list-group-item load" href="#" data-target="' + name + '">' + name +
                '<button class="btn btn-xs btn-danger delete" data-name="' + name + '">' +
                '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
                '</button></a>');
        });
        $('a.load').click(function (e) {
            e.stopPropagation();
            setVals(savedConnections[$(this).data('target')]);
            return false;
        });
        $('a.load').dblclick(function (e) {
            e.stopPropagation();
            start();
            return false;
        });
        $('button.delete').click(function (e) {
            e.stopPropagation();
            delete savedConnections[$(this).data('name')];
            store.set('connections', savedConnections);
            listConnections();
            return false;
        });
    }

    $start.click(start);

    function start() {
        let vals = getVals();
        console.log(vals);
        htermInit(function () {
            vals.col = term.screenSize.width;
            vals.row = term.screenSize.height;
            socket.emit('start', vals);
            $settings.hide();
            $terminal.show().focus();
        });
    }

    $save.click(function () {
        let vals = getVals();
        savedConnections[vals.name] = vals;
        store.set('connections', savedConnections);

        listConnections();
    });



    $ssh.change(function () {
        $sshOptions.show();
    });
    $telnet.change(function () {
        $sshOptions.hide();
    });

    $keyfile.change(function () {
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            $keyfilename.val(this.files[0].name);
            reader.onload = function (e) {
                $key.val(e.target.result);
            };
            reader.readAsText(this.files[0]);
        }
    });

    $keyfile.on('fileclear', function () {
        $key.val('');
        $keyfilename.val('');
    });

    function checkButtons() {
        let obj = getVals();
        if (obj.type === 'ssh') {
            if (obj.host && obj.user) {
                $start.removeAttr('disabled');
                if (obj.name) {
                    $save.removeAttr('disabled');
                } else {
                    $save.attr('disabled', true);
                }
            } else {
                $start.attr('disabled', true);
                $save.attr('disabled', true);
            }
        } else {
            if (obj.host) {
                $start.removeAttr('disabled');
                if (obj.name) {
                    $save.removeAttr('disabled');
                } else {
                    $save.attr('disabled', true);
                }
            } else {
                $start.attr('disabled', true);
                $save.attr('disabled', true);
            }
        }
    }

    $name.keyup(checkButtons);
    $host.keyup(checkButtons);
    $user.keyup(checkButtons);
    $ssh.change(checkButtons);
    $telnet.change(checkButtons);

    checkButtons();


});

