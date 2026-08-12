<?php

namespace App\Services;

use BenBjurstrom\MarkdownObject\Build\MarkdownObjectBuilder;
use BenBjurstrom\MarkdownObject\Tokenizer\TikTokenizer;
use Illuminate\Support\Collection;
use League\CommonMark\CommonMarkConverter;
use League\CommonMark\Parser\MarkdownParser;

class MarkdownChunker
{
    protected $environment;
    protected $builder;
    protected $tokenizer;
    public function __construct()
    {
        $this->environment = ( new CommonMarkConverter )->getEnvironment();
        $this->builder = new MarkdownObjectBuilder;
        $this->tokenizer = TikTokenizer::forModel('text-embedding-3-small');
    }

    public function chunk(string $fileName, string $markdown) :Collection
    {
        $markdown = mb_scrub($markdown, 'UTF-8');
        $markdown = preg_replace('/[\p{So}\x{FE0F}\x{200D}\x{20E3}]/u', '', $markdown) ?? $markdown;

        $document = ( new MarkdownParser($this->environment))->parse($markdown);

        $chunks = $this->builder
            ->build($document, $fileName, $markdown, $this->tokenizer)
            ->toMarkdownChunks(target: 512, hardCap: 1024, tok: $this->tokenizer);

        return collect($chunks)
            ->map(fn ($chunk) => [
                'text' => trim($chunk->markdown),
                'heading' => implode(' > ', $chunk->breadcrumb),
            ])
            ->filter(fn ($chunk) => $chunk['text'] !== '')
            ->values();
    }
}
