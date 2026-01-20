<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KnowledgeBase extends Model
{
    use HasFactory;

    protected $fillable = ['content', 'metadata', 'embedding'];

    protected $casts = [
        'metadata' => 'array',
    ];
}
