/*global module:false*/

var fs = module.require('fs');
var path = module.require('path');
var os = module.require('os');

module.exports = function fxGruntConfig(grunt) {

	'use strict';
	
	// VAR
	var GRUNT_FILE = 'Gruntfile.js';
	
	var BUILD_FILE = './dist/build.json';
	
	var SRC_FOLDERS = [
		'./src/com/',
		'./src/modules/',
		'./src/transitions/',
		'./src/pages/',
		'./src/utils/'
	];
	var SRC_FILES = [];

	// load grunt task
	var loadGruntTasks = function (grunt) {
		grunt.loadNpmTasks('grunt-contrib-uglify');
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.loadNpmTasks('grunt-complexity');
	};

	var createSrcFiles = function () {
		SRC_FOLDERS.forEach(function (folder) {
			var p = path.normalize(folder);
			var files = fs.readdirSync(p);
			
			files.forEach(function (file) {
				SRC_FILES.push(path.normalize(p + file));
			});
		});
	};
	
	var getBuildNumber = function () {
		var b = {};
		
		try {
			b = grunt.file.readJSON(BUILD_FILE);
		} catch (e) {}
		
		b.lastBuild = b.lastBuild > 0 ? b.lastBuild + 1 : 1;
		
		grunt.file.write(BUILD_FILE, JSON.stringify(b));
		
		return b.lastBuild;
	};
	
	var config = {
		pkg: grunt.file.readJSON('package.json'),
		build: 'auto',
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'- build <%= build %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
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
				bitwise: true,
				camelcase: false,
				curly: true,
				eqeqeq: false, // allow ==
				forin: true,
				//freeze: true,
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
				maxlen: 120,
				//maxcomplexity: 10,
				
				// relax options
				//boss: true,
				//eqnull: true, 
				esnext: true,
				regexp: true,
				strict: true,
				trailing: false,
				sub: true, // [] notation
				smarttabs: true,
				lastsemic: false, // enforce semicolons
				white: true,
				
				// env
				browser: true,
				globals: {
					jQuery: true,
					console: true,
					App: true,
					Loader: true
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
				sourceMap: 'dist/framework.map',
				sourceMappingURL: 'framework.map',
				report: 'gzip',
				mangle: true,
				compress: {
					global_defs: {
						'DEBUG': false
					},
					dead_code: true,
					unused: true,
					warnings: true
				},
				preserveComments: false
			}
		},
		complexity: {
			generic: {
				src: SRC_FILES.concat(GRUNT_FILE),
				options: {
					//jsLintXML: 'report.xml', // create XML JSLint-like report
					errorsOnly: false, // show only maintainability errors
					cyclomatic: 10,
					halstead: 25,
					maintainability: 100
				}
			}
		}
	};
	
	var init = function (grunt) {
		// Project configuration.
		grunt.initConfig(config);
		
		// Default task.
		grunt.registerTask('default',  ['jshint', 'complexity', 'concat', 'uglify']);
		grunt.registerTask('dev',      ['jshint', 'complexity']);
		grunt.registerTask('build',    ['jshint', 'concat', 'uglify']);
	};
	
	var load = function (grunt) {
		loadGruntTasks(grunt);
		
		createSrcFiles();
		
		config.build = getBuildNumber();
		
		init(grunt);
		
		console.log('Running grunt on ' + os.platform());
	};

	// load the set-up
	load(grunt);
};