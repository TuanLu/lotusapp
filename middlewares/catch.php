<?php

$ISD_KEY = '';
$PROTECTED_PATHS = '';
if(defined('ISD_APP_KEY')) {
  $ISD_KEY = ISD_APP_KEY;
}
if(defined('PROTECTED_PATHS')) {
  $PROTECTED_PATHS = PROTECTED_PATHS;
}
$app->add(new \Slim\Middleware\JwtAuthentication([
    "rules" => [
        new \Slim\Middleware\JwtAuthentication\RequestPathRule([
            "path" => $PROTECTED_PATHS,
            "passthrough" => ["/login", "/token"]
        ]),
        new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
            "passthrough" => ["/login"]
        ])
    ],
    "secure" => true,//Should use HTTPS request
    "relaxed" => ["localhost", "127.0.0.1"],
    "secret" => $ISD_KEY,
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
// Catch all http errors here.
// $app->add(function ($request, $response, $next) use ($container) {

//     // Default status code.
//     $status = 200;

//     // Catch errors.
//     try {
//         $response = $next($request, $response);
//         $status = $response->getStatusCode();

//         // If it is 404, throw error here.
//         if ($status === 404) {
//             throw new \Exception('Page not found', 404);

//             // A 404 should be invoked.
//             // Note since it is to be taken care by the exception below
//             // so comment this custom 404.
//             // $handler = $container->get('notFoundHandler');
//             // return $handler($request, $response);
//         }
//     } catch (\Exception $error) {
//         $status = $error->getCode();
//         $data = [
//             "status" => $error->getCode(),
//             "messsage" => $error->getMessage()
//         ];
//         $response->getBody()->write(json_encode($data));
//     };

//     return $response
//         ->withStatus($status);
//         //->withHeader('Content-type', 'application/json');
// });

// Sample.
// $app->add(function ($request, $response, $next) {
//     $response->getBody()->write('Check permission');
//     $response = $next($request, $response);
//     $response->getBody()->write('Say hi to every one');

//     return $response;
// });
