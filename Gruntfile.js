module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    var config = {
        mkdir: {
            tmp: {
                options: {
                    create: ['tmp']
                }
            }
        },
        gitclone: {
            hterm: {
                options: {
                    cwd: './tmp',
                    repository: 'https://chromium.googlesource.com/apps/libapps'
                }
            }
        },
        shell: {
            build_hterm: {
                command: 'npm install && npm run prepare && cp ./js/hterm_all.js ../../../public/',
                options: {
                    execOptions: {
                        cwd: './tmp/libapps/hterm'
                    }
                }
            }
        },
        clean: ['./tmp']
    };

    grunt.initConfig(config);

    grunt.registerTask('update-hterm', ['mkdir:tmp', 'gitclone:hterm', 'shell:build_hterm', 'clean']);
};
