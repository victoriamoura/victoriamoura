require = require('esm')(module);
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

// Função auxiliar para importar o gulp-imagemin
async function importImagemin() {
  const imagemin = await import('gulp-imagemin');
  return imagemin.default;
}

// Compilação do SCSS para CSS
gulp.task('scss', function () {
  return gulp
    .src('./src/scss/**/*.scss') // Use globbing para capturar todos os arquivos .scss
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulp.dest('./dist/css'))
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('./dist/css'));
});

// Minificação do JS
gulp.task('js', function () {
  return gulp
    .src('./src/js/*.js')
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      })
    )
    .pipe(gulp.dest('./dist/js'));
});

// Otimização das imagens
gulp.task('img', async function () {
  const imagemin = await importImagemin();
  const { default: imageminMozjpeg } = await import('imagemin-mozjpeg');
  const { default: imageminOptipng } = await import('imagemin-optipng');

  return gulp
    .src('./src/img/*')
    .pipe(imagemin([
      imageminMozjpeg({ quality: 75, progressive: true }),
      imageminOptipng({ optimizationLevel: 5 }),
    ]))
    .pipe(gulp.dest('./dist/img'));
});

// Watcher
gulp.task('watch', function () {
  gulp.watch('./src/scss/**/*.scss', gulp.series('scss')); // Usando globbing para assistir a todas as alterações .scss
  gulp.watch('./src/js/*.js', gulp.series('js'));
  gulp.watch('./src/img/*', gulp.series('img'));
});

// Tarefa padrão
gulp.task('default', gulp.parallel('scss', 'js', 'img', 'watch'));
