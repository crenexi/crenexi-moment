const gulp = require('gulp');
// const series = gulp.series;
const HubRegistry = require('gulp-hub');
const logger = require('./gulp/logger');

const tasksGlob = 'gulp/tasks/*.js';

// Load tasks
const publishTasks = require('./gulp/tasks/publish');

// Load tasks into registry
const hub = new HubRegistry([tasksGlob]);
gulp.registry(hub);

// ##########################
// ### Publishing ###########
// ##########################

// gulp.task('publish', series(...Object.values(publishTasks)));
gulp.task('publish:prod', publishTasks.publishProd);

// ##########################
// ### Default ##############
// ##########################

gulp.task('default', (done) => {
  logger.error('No default gulp task is specified');
  done();
});
