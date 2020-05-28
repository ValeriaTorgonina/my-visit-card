const gulp = require("gulp");
const scss = require("gulp-sass");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const server = require("browser-sync").create();
const minifyCss = require("gulp-csso");
const minifyJs = require("gulp-minify");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const svgSprite = require("gulp-svg-sprite");
const rigger = require("gulp-rigger");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const del = require("del");
const run = require("run-sequence");

gulp.task("clean", () => del("build"));

gulp.task("style", [], () =>
  gulp
    .src("src/scss/style.scss")
    .pipe(plumber())
    .pipe(scss())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest("build/css"))
    .pipe(minifyCss())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream())
);

gulp.task("images", () =>
  gulp
    .src("src/assets/img/**/*.{png,jpg,jpeg,svg}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest("build/assets/img"))
);

gulp.task("html", () =>
  gulp
    .src("src/*.html")
    .pipe(posthtml([include()]))
    .pipe(rigger())
    .pipe(gulp.dest("build"))
);

gulp.task("js", () => {
  gulp.src("src/js/main.js").pipe(minifyJs()).pipe(gulp.dest("build/js"));
});

gulp.task("copy", () =>
  gulp
    .src(["src/assets/**", "src/js/**"], {
      base: "src",
    })
    .pipe(gulp.dest("build"))
);

gulp.task("svgSprite", () => {
  return gulp
    .src("src/assets/img/icons/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(gulp.dest("src/assets/img"));
});

gulp.task("serve", ["style"], () => {
  server.init({
    server: "build/",
    host: "192.168.0.88",
  });

  gulp.watch("src/scss/**/*.scss", ["style"]).on("change", server.reload);
  gulp.watch("src/*.html", ["html"]).on("change", server.reload);
  gulp.watch("src/js/**/*.*", ["copy"]).on("change", server.reload);
  gulp.watch("src/assets/**/*.*", ["copy"]).on("change", server.reload);
});

gulp.task("build", (done) => {
  run("clean", "images", "svgSprite", "copy", "js", "style", "html", done);
});
