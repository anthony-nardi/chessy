'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks( 'grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.initConfig({
    watch: {
      app: {
        files: ['js/bundle.js', 'index.html'],
        options: {
          livereload: true
        }
      },
      js: {
        files: ['js/main.js'],
        tasks: ['browserify']
      }
    },
      browserify: {
        vendor: {
          src: ['js/main.js'],
          dest: 'js/bundle.js'
        }
      }
  });

  grunt.registerTask('default', ['watch']);

};