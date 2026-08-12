<?php

namespace App\Ai\Agents;

use App\Ai\Middleware\RetrieveContext;
use App\Models\DocumentChunk;
use Illuminate\Support\Collection;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasMiddleware;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class ZondaAssistant implements Agent, Conversational, HasMiddleware
{
    use Promptable;

    /**
     * @var Collection<int, DocumentChunk>
     */
    protected Collection $chunks;

    public function __construct()
    {
        $this->chunks = collect();
    }

    /**
     * @param  Collection<int, DocumentChunk>  $chunks
     */
    public function withChunks(Collection $chunks): static
    {
        $this->chunks = $chunks;

        return $this;
    }

    /**
     * @return array<int, RetrieveContext>
     */
    public function middleware(): array
    {
        return [
            new RetrieveContext(minSimilarity: 0.3, limit: 10),
        ];
    }

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return view('prompts.rag', [
            'chunks' => $this->chunks,
        ])->render();
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return [];
    }
}
