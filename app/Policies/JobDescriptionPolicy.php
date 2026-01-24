<?php

namespace App\Policies;

use App\Models\JobDescription;
use App\Models\User;

class JobDescriptionPolicy
{
    /**
     * Determine if the user can view the job description.
     */
    public function view(User $user, JobDescription $jobDescription): bool
    {
        return $user->id === $jobDescription->user_id;
    }

    /**
     * Determine if the user can update the job description.
     */
    public function update(User $user, JobDescription $jobDescription): bool
    {
        return $user->id === $jobDescription->user_id;
    }

    /**
     * Determine if the user can delete the job description.
     */
    public function delete(User $user, JobDescription $jobDescription): bool
    {
        return $user->id === $jobDescription->user_id;
    }
}
