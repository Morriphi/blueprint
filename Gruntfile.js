module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            all: ['lib/**/*.js', 'test/**/*.js']
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        }
    });

    grunt.loadNpmTasks("grunt-mocha-test");
    grunt.loadNpmTasks("grunt-contrib-jshint");

    grunt.registerTask('default', [], function(){
        grunt.task.run('jshint');
        grunt.task.run('mochaTest');
    });
}
