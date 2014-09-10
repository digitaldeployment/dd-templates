module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        files: {
          'css/dd_templates.css': 'less/dd_templates.less'
        }
      },
      production: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          'css/dd_templates.min.css': 'less/dd_templates.less'
        }
      }
    },
    watch: {
      less: {
        files: ['less/**/*.less'],
        tasks: ['less'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['less', 'watch']);
};
