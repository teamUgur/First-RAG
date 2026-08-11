<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentChunk extends Model
{
    protected $fillable = [
        'source',
        'chunk_text',
        'metadata',
        'embedding',
    ];

    protected $casts = [
        'metadata' => 'array',
        'embedding' => 'array',
    ];
}
