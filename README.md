# Slim + Medoo

> Using Medoo with Slim3.

Read the post [here](https://www.codementor.io/lautiamkok/using-eloquent-doctrine-dbal-or-medoo-with-slim-3-byr7kyj59) about this repository.

## Setup

``` bash
# Installation
$ composer install

# Production
$ cd [my-app-name]
$ php -S 0.0.0.0:8080 -t public
```

Then, access the app at http://localhost:8080/

## Dependencies

* [Slim](https://www.slimframework.com/docs/) - A PHP micro framework that helps you quickly write simple yet powerful web applications and APIs.
* [Monolog](https://github.com/Seldaek/monolog) - Sends your logs to files, sockets, inboxes, databases and various web services.
* [Medoo](https://medoo.in/doc) - The lightest PHP database framework to accelerate development.
* [The League Container (Dependency Injection)](https://github.com/thephpleague/container) - A simple but powerful dependency injection container.
* [ramsey/uuid](https://github.com/ramsey/uuid) - A PHP 5.4+ library for generating RFC 4122 version 1, 3, 4, and 5 universally unique identifiers (UUID).

## Setup Virtual Host

* http://foundationphp.com/tutorials/vhosts_mamp.php