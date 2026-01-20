<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KnowledgeBase;
use OpenAI\Laravel\Facades\OpenAI;

class KnowledgeBaseSeeder extends Seeder
{
    /**
     * seed the database with initial info.
     */
    public function run(): void
    {
        $knowledge = [
            "We are hiring a Senior React Developer with 5+ years of experience.",
            "The role requires proficiency in TypeScript, Next.js, and Node.js.",
            "We offer remote work options and a competitive salary range of $120k - $160k.",
            "Our company culture values autonomy, continuous learning, and work-life balance.",
            "Benefits include health insurance, 401k match, and unlimited PTO.",
            "The interview process consists of an initial screening, a technical assessment, and a culture fit interview.",
            "We are looking for someone who can mentor junior developers and lead architectural decisions."
        ];

        foreach ($knowledge as $text) {
            // Generate embedding
            // Note: Make sure OPENAI_API_KEY is set in .env
            try {
                $response = OpenAI::embeddings()->create([
                    'model' => 'text-embedding-3-small',
                    'input' => $text,
                ]);

                $embedding = $response->embeddings[0]->embedding;

                KnowledgeBase::create([
                    'content' => $text,
                    'embedding' => json_encode($embedding)
                ]);

                $this->command->info("Seeded: " . substr($text, 0, 30) . "...");
            } catch (\Exception $e) {
                $this->command->error("Failed to seed: " . $e->getMessage());
            }
        }
    }
}
