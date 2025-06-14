'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ConceptInput({
  onGenerate,
}: {
  onGenerate: (concept: string) => void
}) {
  const [concept, setConcept] = useState('')

  return (
    <div className="flex gap-3 mb-6">
      <Input
        placeholder="Enter a concept (e.g. Binary Search)"
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
      />
      <Button onClick={() => onGenerate(concept)}>Generate</Button>
    </div>
  )
}
