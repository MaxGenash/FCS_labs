"use strict";

var gulp = require("gulp"),
    wiredep = require('wiredep').stream,
//    useref = require('gulp-useref'),
//    gulpif = require('gulp-if'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
//    babel = require("gulp-babel"),
    babelify = require("babelify"),
    browserify = require("browserify"),
    sourse = require("vinyl-source-stream"),
//    sourcemaps = require('gulp-sourcemaps'),
//    less = require('gulp-less'),
    prefixer = require('gulp-autoprefixer'),
//    minifyCss = require('gulp-minify-css'),
//    imagemin = require('gulp-imagemin'),
//    pngquant = require('imagemin-pngquant'),
    browserSync = require("browser-sync"),
    watch = require('gulp-watch'),
    reload = browserSync.reload;

var path = {
    build: { //куда складывать готовые после сборки файлы
        html: './dist/',
        js: './dist/js/',
        style: './dist/css/',
        img: './dist/img/',
        fonts: './dist/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: './app/*.html',
        js: './app/js/main.js',
        style: './app/css/**/*.*',
        img: './app/img/**/*.*',
        fonts: './app/fonts/**/*.*'
    },
    watch: { //за изменением каких файлов мы хотим наблюдать
        html: './app/**/*.html',
        js: './app/js/**/*.*',
        style: './app/css/**/*.*',
        img: './app/img/**/*.*',
        fonts: './app/fonts/**/*.*'
    },
    clean: './dist'
};


//переменная с настройками нашего dev сервера:
var config = {
    server: {
        baseDir: "./dist/"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "GKS_labs_gulp_info"
};

//bower
gulp.task('bower', function () {
    gulp.src('app/index.html')
        .pipe(wiredep({
            directory: "app/bower_components"
        }))
        .pipe(gulp.dest('./app'));
    gulp.src("./app/bower_components/**/*.*")
        .pipe(gulp.dest("./dist/bower_components"));
});

gulp.task('html:build', ['bower'], function () {
    gulp.src(path.src.html)                 //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.html))   //Выплюнем их в папку build
        .pipe(reload({stream: true}));      //И перезагрузим наш сервер для обновлений
});

gulp.task('js:build', function () {
    browserify(path.src.js, { debug: true })
        .transform(babelify
            .configure({
                sourceMapRelative: "./app/js"
            })
        )
        .bundle()
        .pipe(sourse('all.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) 
  //      .pipe(sourcemaps.init()) 
  //      .pipe(less()) 
        .pipe(prefixer()) 			//Добавим вендорные префиксы
  //      .pipe(minifyCss()) 		//Сожмем
  //      .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.style))
        .pipe(reload({stream: true}));
});
/*
gulp.task('image:build', function () {
    gulp.src(path.src.img) 				//Выберем наши картинки
        .pipe(imagemin({ 				//Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) 
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});
*/

//clean
gulp.task('clean', function () {
    return gulp.src(path.clean, {read: false})
        .pipe(clean());
});

gulp.task('build', [
    'bower',
    'html:build',
    'js:build',
    'style:build'/*,
    'fonts:build',
    'image:build'*/
], function(){
    gulp.src('.app/bower_components')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
  /*  watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    */
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('default', ['build', 'webserver', 'watch']);




////build2
//gulp.task('build2', ['clean'], function () {
//    var babelStream = gulp.src('*/**/main.js')
//        .pipe(sourcemaps.init())
//        .pipe(babel())
//        .pipe(sourcemaps.write());
//    var assets = useref.assets({ additionalStreams: [babelStream] });
//    return gulp.src('app/index.html')
//        .pipe(assets)
//        .pipe(gulpif('*.css', prefixer()))
//        .pipe(assets.restore())
//        .pipe(useref())
//        .pipe(gulp.dest('./dist'));
//      //  .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
//});

