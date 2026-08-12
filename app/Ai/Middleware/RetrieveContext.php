<?php

namespace App\Ai\Middleware;

use Closure;
use App\Models\DocumentChunk;
use Laravel\Ai\Prompts\AgentPrompt;
use Laravel\Ai\Responses\AgentResponse;

class RetrieveContext
{
    public function __construct(
        protected float $minSimilarity = 0.3,
        protected int $limit = 10,
    ) {}
    /**
     * Handle the incoming prompt.
     */
    public function handle(AgentPrompt $prompt, Closure $next)
    {
        $chunks = DocumentChunk::whereVectorSimilarTo(
            'embedding',
            $prompt->prompt,
            $this->minSimilarity,
        )
            ->limit($this->limit)
            ->get();

        logger('RAG context retrieved', [
            'question' => $prompt->prompt,
            'chunks' => $chunks->count(),
            'sources' => $chunks->pluck('source')->unique()->values()->all(),
            'metadata' => $chunks->pluck('metadata')->all(),
        ]);

        $context = $chunks
            ->map(function (DocumentChunk $chunk, int $index): string {
                $number = $index + 1;
                $heading = data_get($chunk->metadata, 'heading', 'No heading');

                return <<<TEXT
                    Document {$number}
                    Source: {$chunk->source}
                    Heading: {$heading}
                    Text:
                    {$chunk->chunk_text}
                    TEXT;
                                })
                    ->implode("\n\n---\n\n");
            $prompt = $prompt->append(<<<PROMPT
                Retrieved document context:

                {$context}
                PROMPT);

        return $next($prompt);
    }
}
