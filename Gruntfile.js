/*global module:false*/

var fs = module.require('fs');
var path = module.require('path');
var os = module.require('os');
var md = module.require('matchdep');

module.exports = function fxGruntConfig (grunt) {

	'use strict';
	
	var GRUNT_FILE = 'Gruntfile.js';
	
	var BUILD_FILE = './dist/build.json';
	
	var SRC_FILES = [
		'./src/com/*.js',
		'./src/modules/*.js',
		'./src/transitions/*.js',
		'./src/pages/*.js',
		'./src/utils/*.js'
	];
	
	var JSCS_FILE = '.jscsrc';
	
	var config = {
		pkg: grunt.file.readJSON('package.json'),
		buildnum: {
			options: {
				file: BUILD_FILE
			}
		},
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> ' +
			'- build <%= buildnum.num %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
			' * Copyright (c) <%= grunt.template.today("yyyy") %> ' +
			'<%= pkg.author.name %> (<%= pkg.author.url %>);\n' +
			' * <%= pkg.license %> */'
		},
		concat: {
			options: {
				process: true,
				banner: '<%= meta.banner %>'
			},
			dist: {
				src: SRC_FILES,
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		watch: {
			files: SRC_FILES.concat(GRUNT_FILE),
			tasks: ['jshint', 'complexity']
		},
		jshint: {
			files: SRC_FILES.concat(GRUNT_FILE),
			//force: true,
			options: {
				esversion: 5,
				bitwise: false,
				camelcase: false,
				curly: true,
				eqeqeq: false, // allow ==
				forin: true,
				freeze: true,
				immed: false, //
				latedef: true, // late definition
				newcap: true, // capitalize ctos
				noempty: true,
				nonew: true, // no new ..()
				noarg: true,
				plusplus: false,
				quotmark: 'single',
				undef: true,
				maxparams: 5,
				maxdepth: 5,
				maxstatements: 30,
				maxlen: 100,
				nonbsp: true,

				// relax options
				regexp: true,
				strict: true,
				trailing: false,
				sub: true, // [] notation
				smarttabs: true,
				lastsemic: false, // enforce semicolons

				// env
				browser: true,

				globals: {
					jQuery: true,
					console: true,
					App: true,
					Loader: true,
					_: true,
					google: true,
					module: true,
					CSS3: true
				}
			}
		},
		uglify: {
			prod: {
				files: {
					'dist/<%= pkg.name %>.min.js': '<%= concat.dist.dest %>'
				}
			},
			options: {
				banner: '<%= meta.banner %>',
				sourceMap: 'dist/<%= pkg.name %>.map',
				sourceMappingURL: '<%= pkg.name %>.map',
				report: 'gzip',
				mangle: true,
				compress: {
					global_defs: {
						DEBUG: false
					},
					dead_code: true,
					unused: true,
					warnings: true
				},
				preserveComments: 'some'
			}
		},
		complexity: {
			generic: {
				src: SRC_FILES,
				exclude: [
					'./src/utils/keys.js'
				],
				options: {
					//jsLintXML: 'report.xml', // create XML JSLint-like report
					errorsOnly: false, // show only maintainability errors
					cyclomatic: 15,
					halstead: 25,
					maintainability: 100
				}
			}
		},
		jscs: {
			src: SRC_FILES.concat(GRUNT_FILE),
			options: {
				config: JSCS_FILE,
				fix: true,
				disallowDanglingUnderscores: {
					allExcept: ['_currentPage', '_templateSettings']
				}
			}
		}
	};
	
	var init = function (grunt) {
		// Overrides some values
		grunt.util.linefeed = '\n';
		grunt.file.preserveBOM = false;
		
		// Project configuration.
		grunt.initConfig(config);

		// generate build number
		grunt.registerTask('buildnum',
			'Generates and updates the current build number', function () {
			var options = this.options();
			var getBuildNumber = function () {
				var b = {};
				
				try {
					b = grunt.file.readJSON(options.file);
				} catch (e) {}
				
				b.lastBuild = b.lastBuild > 0 ? b.lastBuild + 1 : 1;
				
				grunt.file.write(options.file, JSON.stringify(b));
				
				return b.lastBuild;
			};

			var buildnum = getBuildNumber();
			grunt.log.writeln('New build num: ', buildnum);
			grunt.config.set('buildnum.num', buildnum);
		});
		
		// Default task.
		grunt.registerTask('dev', ['jscs', 'jshint', 'complexity']);
		grunt.registerTask('build', ['buildnum', 'concat', 'uglify']);
		grunt.registerTask('default', ['dev', 'build']);
	};
	
	var load = function (grunt) {
		md.filterDev('grunt-*').forEach(grunt.loadNpmTasks);
		
		init(grunt);
		
		console.log('Running grunt on ' + os.platform());
	};

	// load the set-up
	load(grunt);
};
