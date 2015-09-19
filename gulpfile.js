var gulp = require("gulp"),
    wiredep = require('wiredep').stream;

gulp.task('bower', function () {
    gulp.src('app/index.html')
        .pipe(wiredep({
            directory: "app/bower_components"
        }))
        .pipe(gulp.dest('./app'));
});
