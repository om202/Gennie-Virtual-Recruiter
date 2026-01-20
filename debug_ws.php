<?php

require 'vendor/autoload.php';

use WebSocket\Client;

$key = getenv('DEEPGRAM_API_KEY');
if (!$key) {
    // Fallback to reading .env manually if getenv fails in CLI
    $env = file_get_contents('.env');
    preg_match('/DEEPGRAM_API_KEY=(.*)/', $env, $matches);
    $key = trim($matches[1] ?? '');
}

echo "Testing Key: " . substr($key, 0, 5) . "...\n";

try {
    $url = "wss://agent.deepgram.com/agent";
    echo "Connecting to $url ...\n";

    $client = new Client($url, [
        'headers' => [
            'Authorization' => "Token $key"
        ],
        'timeout' => 5
    ]);

    echo "Connected! Sending config...\n";

    $client->send(json_encode([
        'type' => 'SettingsConfiguration',
        'audio' => [
            'input' => ['encoding' => 'linear16', 'sample_rate' => 48000],
            'output' => ['encoding' => 'linear16', 'sample_rate' => 48000, 'container' => 'none']
        ],
        'agent' => [
            'listen' => ['model' => 'nova-2'],
            'think' => ['provider' => ['type' => 'open_ai'], 'model' => 'gpt-4o'],
            'speak' => ['model' => 'aura-asteria-en']
        ]
    ]));

    echo "Config sent. Waiting for response...\n";
    $msg = $client->receive();
    echo "Received: " . $msg . "\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
