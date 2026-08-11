<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\DocumentChunk;
use App\Services\MarkdownChunker;
use Laravel\Ai\Embeddings;
use Symfony\Component\Finder\Finder;

#[Signature('app:ingest-markdown-documents {path}')]
#[Description('Ingest markdown documents')]
class IngestMarkdownDocuments extends Command
{
    public function handle(MarkdownChunker $chunker)
    {
        $path = $this->argument('path');
        $files = Finder::create()->files()->name('*.md')->in($path);

        $this->info('Files found: ' . count($files));

        foreach ($files as $file)
        {
            $chunks = $chunker->chunk(
                $file->getRelativePathname(),
                $file->getContents(),
            );

            if ($chunks->isEmpty()) {
                continue;
            }

            $texts = $chunks->pluck('text')->toArray();
            $response = Embeddings::for($texts)->generate();

            $chunks->each(fn ($chunk, $index) => DocumentChunk::create([
                'source' => $file->getRelativePathname(),
                'chunk_text' => $chunk['text'],
                'metadata' => [
                    'heading' => $chunk['heading'],
                    'hash' => hash('sha256', $chunk['text']),
                ],
                'embedding' => $response->embeddings[$index],
            ]));
        }
        $this->info('Ingestion complete.');
    }
}
