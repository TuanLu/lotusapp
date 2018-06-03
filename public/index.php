<?php

require __DIR__ . '/../bootstrap.php';

require __DIR__ . '/../app/routes.php';

// Register dependencies.
require __DIR__ . '/../dependencies.php';

// Register middlewares.
require __DIR__ . '/../middlewares.php';

// Run the application!
$app->run();
