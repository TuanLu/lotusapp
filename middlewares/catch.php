<?php

$app->add(new \Slim\Middleware\JwtAuthentication([
    "rules" => [
        new \Slim\Middleware\JwtAuthentication\RequestPathRule([
            "path" => PROTECTED_PATHS,
            "passthrough" => ["/login", "/token"]
        ]),
        new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
            "passthrough" => ["/login"]
        ])
    ],
    "secure" => true,//Should use HTTPS request
    "relaxed" => ["localhost", "127.0.0.1"],
    "secret" => ISD_APP_KEY,
    "callback" => function ($request, $response, $arguments) use ($container) {
        $container["jwt"] = $arguments["decoded"];
    },
    "error" => function ($request, $response, $arguments) {
        $data["status"] = "error";
        $data["show_login"] = true;
        $data["message"] = "Bạn không có quyền để thực hiện tác vụ này";//$arguments["message"];
        return $response
            ->withHeader("Content-Type", "application/json")
            ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    }
  ]));
